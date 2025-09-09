import * as mediasoupClient from "mediasoup-client";

export class RoomClient {
  constructor(set, get) {
    this.ws = null;
    this.device = null;
    this.sendTransport = null;
    this.recvTransport = null;
    this.localStream = null;
    this.producers = new Map();
    this.consumers = new Map();
    this.producerIdToConsumer = new Map(); //   producerId -> consumer 맵
    this.producerToPeerIdMap = new Map(); // producerId -> peerId 맵 추가
    this.actionCallbackMap = new Map();
    this.pendingConsumeList = [];
    this.isAdmin = false;
    this.screenProducer = null; // 화면 공유 프로듀서
    this.myPeerId = null; // 자신의 peerId를 저장할 속성 추가
    this.eventListeners = new Map(); // 이벤트 리스너 맵 추가
    this.messageQueue = []; // WebSocket 메시지 큐 추가
    this.set = set; // Zustand set 함수 주입
    this.get = get; // Zustand get 함수 주입
  }

  // WebSocket 메시지 큐에 메시지 추가 또는 즉시 전송
  _sendWsMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }
  }

  // 큐에 있는 메시지 전송
  _flushMessageQueue() {
    while (this.messageQueue.length > 0 && this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift();
      this.ws.send(JSON.stringify(message));
    }
  }

  // 이벤트 리스너 추가
  on(eventName, listener) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName).push(listener);
  }

  // 이벤트 리스너 제거
  off(eventName, listener) {
    if (!this.eventListeners.has(eventName)) return;
    const listeners = this.eventListeners.get(eventName).filter(l => l !== listener);
    this.eventListeners.set(eventName, listeners);
  }

  // 이벤트 발생
  emit(eventName, ...args) {
    if (!this.eventListeners.has(eventName)) return;
    this.eventListeners.get(eventName).forEach(listener => listener(...args));
  }

  // 한 번만 실행되는 이벤트 리스너 추가
  once(eventName, listener) {
    const wrapper = (...args) => {
      listener(...args);
      this.off(eventName, wrapper);
    };
    this.on(eventName, wrapper);
  }

  sendChatMessage(text) {
    const messageData = {
      sender: this.myPeerId, // 자신의 ID를 보낸 사람으로 설정
      userName: this.get().participants.find(p => p.isLocal)?.userName || 'Unknown User', // Zustand에서 실제 사용자 이름 가져오기
      text: text,
    };
    this._sendWsMessage({
      action: 'chatMessage',
      data: messageData,
    });
  }

  sendCanvasData(data) {
    this._sendWsMessage({
      action: 'canvas',
      data: { ...data, sender: this.myPeerId },
    });
  }

  join(roomId, userName, userEmail, tenantId, options = {}) {
    this.initialMediaStates = {
      micMuted: options.initialMicMuted,
      cameraOff: options.initialCameraOff
    };
    this.myUserName = userName; // Store userName for later use

    if (!roomId) {
      throw new Error("roomId is required to join a room");
    }
    const wsUrl = `wss://${import.meta.env.VITE_WEBSOCKET_URL}/?roomId=${roomId}&userName=${encodeURIComponent(userName)}&userEmail=${encodeURIComponent(userEmail)}&tenantId=${encodeURIComponent(tenantId)}`;

    this.ws = new WebSocket(wsUrl);
    this.ws.onopen = () => {
      try {
        this.device = new mediasoupClient.Device();
        this._sendWsMessage({ action: "getRtpCapabilities" });
        this._flushMessageQueue(); // 연결 열리자마자 큐 비우기
      } catch (err) {
        console.error("Device creation failed:", err);
        this.set({ error: { message: "미디어 장치 초기화에 실패했습니다.", details: err.message } });
      }
    };

    this.ws.onerror = (event) => {
      console.error("WebSocket error:", event);
      this.set({ error: { message: "서버 연결에 실패했습니다.", details: "WebSocket connection error." } });
    };

    this.ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);

      const cb = this.actionCallbackMap.get(msg.action);
      if (cb) {
        cb(msg);
        this.actionCallbackMap.delete(msg.action);
        return;
      }

      switch (msg.action) {
        case "adminInfo":
          this.isAdmin = msg.data.isAdmin;
          this.myPeerId = msg.data.peerId; // 이 시점에서 myPeerId가 설정됨
          this.emit("adminStatus", msg.data); // UI 매니저에게 알림
          break;
        case "canvas":
          this.emit("canvas", msg.data);
          break;
        case "canvasState":
          this.set({ isWhiteboardActive: msg.data.isActive });
          break;
        case "rtpCapabilities":
          await this._handleRtpCapabilities(msg.data);
          break;
        case "createTransportResponse":
          await this._handleCreateTransportResponse(msg.data);
          break;
        case "createConsumerTransportResponse":
          await this._handleCreateConsumerTransportResponse(msg.data);
          break;
        case "existingProducers":
          await this._handleExistingProducers(msg.data);
          break;
        case "newProducerAvailable":
          await this._handleNewProducerAvailable(msg);
          break;
        // case "consumeResponse":
        //   await this._handleConsumeResponse(msg.data);
        //   break;
        case "producerClosed":
          this._handleProducerClosed(msg);
          break;
        case "producerStateChanged": {
          const { producerId, kind, state } = msg.data;
          if (state === "pause") {
            this.emit("remote-producer-pause", { producerId, kind });
          } else if (state === "resume") {
            this.emit("remote-producer-resume", { producerId, kind });
          }
          break;
        }
        // dominantSpeaker 이벤트 처리
        case "dominantSpeaker": {
          const { producerId, peerId } = msg.data;
          this.emit("dominantSpeaker", { producerId, peerId });
          break;
        }
        case "peerClosed": {
          this._handlePeerClosed(msg.data);
          break;
        }
        case 'chatMessage': {
          // 서버로부터 받은 메시지를 'chatMessage' 이벤트로 외부에 전달합니다.
          this.emit('chatMessage', msg.data);
          break;
        }
      }
    };
  }

  sendPeerStatus(statusData) {
    this._sendWsMessage({
      action: "updatePeerStatus",
      data: statusData,
    });
  }

  _waitForAction(actionName, callback) {
    this.actionCallbackMap.set(actionName, callback);
  }

  _handlePeerClosed({ peerId }) {
    // 이 peer가 남긴 모든 consumer를 찾아서 정리
    for (const consumer of this.consumers.values()) {
      if (consumer.appData.peerId === peerId) { // consumer 생성 시 peerId를 저장
        consumer.close();
        this.consumers.delete(consumer.id);
        this.emit('consumer-closed', { consumerId: consumer.id, peerId: peerId });
      }
    }
    this.emit('peer-closed', { peerId }); // UI에 peer가 나갔음을 알림
  }

  async _handleRtpCapabilities(data) {
    try {
      await this.device.load({ routerRtpCapabilities: data });
      this._sendWsMessage({ action: "createTransport" });
    } catch (err) {
      console.error("Failed to load device capabilities:", err);
      this.set({ error: { message: "미디어 장치 로드에 실패했습니다.", details: err.message } });
    }
  }

  async _handleCreateTransportResponse(data) {
    this.sendTransport = this.device.createSendTransport(data);

    this.sendTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
      this._sendWsMessage({ action: "connectTransport", data: { dtlsParameters } });
      this._waitForAction("transportConnected", callback);
    });

    this.sendTransport.on("produce", async ({ kind, rtpParameters, appData }, callback, errback) => {
      try {
        const { id } = await this._sendRequest("produce", { kind, rtpParameters, appData });
        this.emit('producer-created', { kind, producerId: id });
        callback({ id });
      } catch (error) {
        errback(error);
      }
    });

    if (!this.myPeerId) {
      await new Promise(resolve => this.once("adminStatus", resolve));
    }
    await this._startProducing();
  }

  async _startProducing() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      });

      const videoElement = document.createElement("video");
      videoElement.id = "localVideo";
      videoElement.muted = true;
      videoElement.autoplay = true;
      videoElement.playsInline = true;
      videoElement.style.cssText = "height: 100%; width: 100%; object-fit: cover;";
      videoElement.srcObject = this.localStream;

      // 2. 생성된 video 요소와 peerId를 UI 로직으로 전달
      this.emit("localStreamReady", videoElement, this.myPeerId);
      this.set({ localStream: this.localStream }); // Zustand 스토어에 localStream 명시적으로 설정

      const videoTrack = this.localStream?.getVideoTracks()[0];
      const audioTrack = this.localStream?.getAudioTracks()[0];

      if (!videoTrack) {
        console.error("_startProducing: No video track found in localStream.");
      }
      if (!audioTrack) {
        console.error("_startProducing: No audio track found in localStream.");
      }

      // 3. produce를 호출하고, 반환된 실제 Producer 객체를 맵에 저장
      if (videoTrack) {
        const videoProducer = await this.sendTransport.produce({
          track: videoTrack,
          appData: { source: 'webcam', peerId: this.myPeerId, userName: this.myUserName }
        });
        this.producers.set(videoProducer.id, videoProducer);
      }
      if (audioTrack) {
        const audioProducer = await this.sendTransport.produce({
          track: audioTrack,
          appData: { source: 'mic', peerId: this.myPeerId, userName: this.myUserName }
        });
        this.producers.set(audioProducer.id, audioProducer);
      }

      // Apply initial states
      if (this.initialMediaStates) {
        await this.setAudioEnabled(!this.initialMediaStates.micMuted);
        await this.setVideoEnabled(!this.initialMediaStates.cameraOff);
      }

    } catch (err) {
      console.error('getUserMedia error:', err?.name, err?.message, err);
      // localStream 획득 실패 시 Zustand 상태 업데이트
      this.set({
        localStream: null, // 스트림을 null로 설정
        localStreamError: { message: `카메라/마이크를 가져올 수 없습니다: ${err.name}`, details: err.message },
        error: { message: `카메라/마이크를 가져올 수 없습니다: ${err.name}`, details: err.message } // 기존 에러도 업데이트
      });
      // 권한/환경 문제 분기
      if (err?.name === 'NotAllowedError') {
        console.warn('카메라/마이크 권한이 거부되었습니다.');
      } else if (err?.name === 'NotReadableError') {
        console.warn('카메라/미디어 장치를 사용할 수 없습니다. 다른 애플리케이션에서 사용 중이거나 장치가 연결되어 있지 않을 수 있습니다.');
      } else if (err?.name === 'OverconstrainedError') {
        console.warn('요청한 미디어 제약 조건을 충족하는 장치를 찾을 수 없습니다.');
      }
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        console.warn('getUserMedia는 https 또는 localhost에서만 동작합니다.');
      }
    }

    // 로컬 스트림 생성 여부와 관계없이 연결 완료 처리
    this._sendWsMessage({ action: "deviceReady" });
    this.emit("controlsReady");
    this.emit("connected"); // 클라이언트가 완전히 연결되었음을 알림
  }

  async _handleCreateConsumerTransportResponse(data) {
    this.recvTransport = this.device.createRecvTransport(data);
    this.recvTransport.on("connect", ({ dtlsParameters }, callback) => {
      this._sendWsMessage({
        action: "connectConsumerTransport",
        data: { dtlsParameters },
      });
      this._waitForAction("consumerTransportConnected", callback);
    });

    //    recvTransport가 준비되었으므로, 대기 중인 모든 consumer를 처리
    const pendingConsumes = [...this.pendingConsumeList];
    this.pendingConsumeList = [];
    for (const consumeData of pendingConsumes) {
      await this._consume(consumeData);
    }
  }

  async _handleExistingProducers(producers) {
    for (const producer of producers) {
      // 중복 consumer 생성을 방지하는 가드 (producerIdToConsumer 맵 확인)
      if (!this.producerIdToConsumer.has(producer.producerId)) {
        this.pendingConsumeList.push(producer);
      } else {
        console.warn(`Producer ${producer.producerId} already has a consumer. Skipping adding to pending list.`);
      }
    }

    // 칠판의 현재 상태를 서버에 요청
    this._sendWsMessage({ action: 'getCanvasState' });

    //    recvTransport가 아직 없으면 생성을 요청하고,
    //    이미 있다면 바로 대기열을 처리하여 타이밍 문제를 해결.
    if (!this.recvTransport) {
      this.ws.send(JSON.stringify({ action: "createConsumerTransport" }));
    } else {
      const pendingConsumes = [...this.pendingConsumeList];
      this.pendingConsumeList = [];
      for (const consumeData of pendingConsumes) {
        await this._consume(consumeData);
      }
    }
  }

  async _handleNewProducerAvailable(producerInfo) {
    const { producerId, kind, appData } = producerInfo;
    const consumeData = { producerId, kind, appData }; // appData도 전달

    //    recvTransport가 없으면 대기열에 추가
    if (!this.recvTransport) {
      this.pendingConsumeList.push(consumeData);
    } else {
      await this._consume(consumeData);
    }
  }

  async _consume({ producerId, kind, appData }) {
    //    중복 consumer 생성을 방지하는 가드
    if (this.producerIdToConsumer.has(producerId)) {
      return;
    }
    if (!this.recvTransport) {
      this.pendingConsumeList.push({ producerId, kind, appData }); // appData도 함께 큐에 저장
      return;
    }
    try {
      const data = await this._sendRequest("consume", {
        rtpCapabilities: this.device.rtpCapabilities,
        producerId,
        kind,
      });

      const consumer = await this.recvTransport.consume({
        id: data.id,
        producerId: data.producerId,
        kind: data.kind,
        rtpParameters: data.rtpParameters,
        appData: { ...appData }, // 서버에서 받은 appData를 consumer에 저장
      });
      this.consumers.set(consumer.id, consumer);
      this.producerIdToConsumer.set(producerId, consumer); //    새 맵에 추가
      // peerId를 consumer의 appData에서 가져와 producerIdToPeerIdMap에 저장
      if (appData && appData.peerId) {
        this.producerToPeerIdMap.set(producerId, appData.peerId);
      }

      // UI 매니저가 화면에 그릴 수 있도록 이벤트를 발생
      this.emit("new-consumer", consumer);

      // 클라이언트 측에서 즉시 resume 호출 (레이스 컨디션 방지)
      if (consumer.kind === 'video') {
        consumer.resume();
      }

      // 4. 생성된 consumer를 즉시 resume하도록 서버에 요청
      this._sendWsMessage({
        action: "resumeConsumer",
        data: { consumerId: consumer.id },
      });
    } catch (error) {
      console.error(`Failed to create consumer for ${producerId}:`, error);
      this.set({ error: { message: `소비자 생성에 실패했습니다: ${producerId}`, details: error.message } });
    }
  }

  _handleProducerClosed({ producerId }) {
    const consumer = this.producerIdToConsumer.get(producerId);
    let isRemoteScreenShare = false;

    if (consumer) {
      if (consumer.appData.source === 'screen') {
        isRemoteScreenShare = true;
      }
      consumer.close();
      this.consumers.delete(consumer.id);
      this.producerIdToConsumer.delete(producerId);
    }

    const peerId = this.producerToPeerIdMap.get(producerId);
    if (peerId) {
      this.producerToPeerIdMap.delete(producerId);
    }

    const isScreenShareProducer =
      this.screenProducer && this.screenProducer.id === producerId;
    const producer = this.producers.get(producerId);
    const isLocalVideoProducer = producer && producer.kind === 'video' && (producer.appData && !producer.appData.source);

    this.emit("producer-closed", { producerId, isScreenShareProducer, isLocalVideoProducer, peerId, isRemoteScreenShare });
  }
  async _sendRequest(action, data) {
    return new Promise((resolve, reject) => {
      const callbackAction = `${action}Response`;
      this._waitForAction(callbackAction, (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.data);
        }
      });
      this._sendWsMessage({ action, data });
    });
  }
  //    오디오 트랙을 끄거나 켬
  async setAudioEnabled(enabled) {
    const audioProducer = this._findProducerByKind("audio", "mic");
    if (!audioProducer) {
      console.warn("setAudioEnabled: Audio producer not found.");
      return;
    }

    try {
      if (enabled) {
        await audioProducer.resume();
      } else {
        await audioProducer.pause();
      }

      this._sendWsMessage({
        action: "changeProducerState",
        data: {
          producerId: audioProducer.id,
          kind: "audio",
          action: enabled ? "resume" : "pause",
        },
      });

      this.emit("localAudioStateChanged", enabled);

    } catch (error) {
      console.error("Failed to change audio state:", error);
      this.emit("localAudioStateChanged", !audioProducer.paused);
    }
  }

  //    비디오 트랙을 끄거나 켬
  async setVideoEnabled(enabled) {
    const videoProducer = this._findProducerByKind("video", "webcam");
    if (!videoProducer) {
      console.warn("setVideoEnabled: Video producer not found.");
      return;
    }

    try {
      if (enabled) {
        await videoProducer.resume();
      } else {
        await videoProducer.pause();
      }

      this._sendWsMessage({
        action: "changeProducerState",
        data: {
          producerId: videoProducer.id,
          kind: "video",
          action: enabled ? "resume" : "pause",
        },
      });

      this.emit("localVideoStateChanged", enabled);

    } catch (error) {
      console.error("Failed to change video state:", error);
      this.emit("localVideoStateChanged", !videoProducer.paused);
    }
  }
  _findProducerByKind(kind, source) {
    for (const producer of this.producers.values()) {
      if (producer.kind === kind && producer.appData.source === source) {
        return producer;
      }
    }
    return null;
  }

  //    화면 공유 시작
  async startScreenShare() {
    if (this.screenProducer) {
      console.warn("Screen sharing is already active.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      const track = stream.getVideoTracks()[0];

      this.screenProducer = await this.sendTransport.produce({
        track,
        appData: { source: "screen" },
      });

      // 브라우저의 '공유 중지' 버튼 클릭 감지
      track.onended = () => {
        this.stopScreenShare();
      };

      this.producers.set(this.screenProducer.id, this.screenProducer);
      // isSharing 상태와 함께 track 정보도 스토어에 저장
      this.set({ isScreenSharing: true, screenShareTrack: track });
    } catch (err) {
      console.error("Failed to start screen sharing:", err);
      this.set({ error: { message: "화면 공유 시작에 실패했습니다.", details: err.message } });
    }
  }

  //    화면 공유 중지
  async stopScreenShare() {
    if (!this.screenProducer) {
      console.warn("No active screen share to stop.");
      return;
    }
    // 서버에 화면 공유 중지를 명시적으로 요청
    this._sendWsMessage({
      action: "stopScreenShare",
      data: { producerId: this.screenProducer.id },
    });

    // 로컬 프로듀서 정리
    const producerId = this.screenProducer.id;
    this.screenProducer.close(); // 스트림을 닫고 'close' 이벤트를 발생시킴
    this.producers.delete(producerId);
    this.screenProducer = null;
    // isSharing 상태와 함께 track 정보도 null로 초기화
    this.set({ isScreenSharing: false, screenShareTrack: null });
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
    if (this.sendTransport) {
      this.sendTransport.close();
    }
    if (this.recvTransport) {
      this.recvTransport.close();
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
    this.eventListeners.clear();
  }
}
