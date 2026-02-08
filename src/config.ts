export interface AppConfig {
    tenantId: string;
    companyName: string;
    companyFullName: string;
    companycompanyLandingPage: string;
    LoginPageDarkLogo: string;
    LoginPageLightLogo: string;
    lightLogoSmall: string;
    darkLogoSmall: string;
    logoSmallNoText: string;
    LogoPath: string;
    CRMEnable: boolean;
    vpdEnable: boolean;
    interviewEnable: boolean;
    meetingEnable: boolean;
    messengerEnable: boolean;
    AIEnable: boolean;
}

export const appConfig: AppConfig = {
    // Branding
    tenantId: 'taiger-consultancy',
    companyName: 'TaiGer',
    companyFullName: 'TaiGer Consultancy Ltd.',
    companycompanyLandingPage: 'https://taigerconsultancy.com/',
    LoginPageDarkLogo: '/assets/logo-new/Taiger_LT_C_H_EN-1',
    LoginPageLightLogo: '/assets/logo-new/Taiger_LT_C_H_EN',
    lightLogoSmall: '/assets/logo-new/Taiger_LT_C_H_EN-2',
    darkLogoSmall: '/assets/logo-new/Taiger_LT_C_H_EN-3',
    logoSmallNoText: '/assets/logo-new/Taiger_LT_C',
    LogoPath: '',
    // Application level comfiguration
    CRMEnable: true,
    vpdEnable: true,
    interviewEnable: true,
    meetingEnable: true,
    messengerEnable: true,
    AIEnable: true
};
