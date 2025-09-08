export const LoginPagePreview = ({ customization }) => {
    const {
        backgroundImage,
        logo,
        logoSize,
        mainTitle,
        mainTitleColor,
        mainTitleSize,
        mainTitleFont,
        subTitle,
        subTitleColor,
        subTitleSize,
        subTitleFont,
        extraTitle,
        extraTitleColor,
        extraTitleSize,
        extraTitleFont,
        overlayOpacity,
        overlayColor,
        primaryColor,
        accentColor,
        tenantName
    } = customization;

    const leftPanelStyle = {
        position: 'relative',
        width: '50%',
        height: '100%',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        textAlign: 'center',
        color: 'white',
    };

    const overlayStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: overlayColor,
        opacity: (overlayOpacity || 0) / 100,
        zIndex: 1,
    };

    const textContentStyle = {
        position: 'relative',
        zIndex: 2,
    };

    return (
        <div style={{ display: 'flex', height: '100%', fontFamily: 'sans-serif' }}>
            {/* Left Side */}
            <div style={leftPanelStyle}>
                <div style={overlayStyle}></div>
                {logo && (
                    <img
                        src={logo}
                        alt="Logo"
                        style={{
                            position: 'absolute',
                            top: '24px',
                            left: '24px',
                            width: `${logoSize}px`,
                            height: `${logoSize}px`,
                            objectFit: 'contain',
                            zIndex: 3
                        }}
                    />
                )}
                <div style={textContentStyle}>
                    <h1 style={{ color: mainTitleColor, fontSize: `${mainTitleSize}px`, fontWeight: mainTitleFont, marginBottom: '20px' }}>
                        {mainTitle}
                    </h1>
                    <p style={{ color: subTitleColor, fontSize: `${subTitleSize}px`, fontWeight: subTitleFont, marginBottom: '24px' }}>
                        {subTitle}
                    </p>
                    <p style={{ color: extraTitleColor, fontSize: `${extraTitleSize}px`, fontWeight: extraTitleFont }}>
                        {extraTitle}
                    </p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div style={{ width: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: '32px' }}>
                <div style={{ width: '100%', maxWidth: '320px' }}>
                    <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#1f2937' }}>{tenantName}에 로그인</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <input type="text" placeholder="아이디를 입력해주세요." style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                        <input type="password" placeholder="비밀번호를 입력해주세요." style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                        <button style={{ width: '100%', padding: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: primaryColor, color: accentColor, fontSize: '16px', fontWeight: '600' }}>
                            Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
