import axios from "axios";

const responseHandler = (response) => {
    const responseBody = response.data;
    return responseBody;
};

const errorHandler = (err) => {
    if (!err.response || !err.response.data) return null;
    const responseBody = err.response.data;
    return responseBody;
}

const DOMAIN = 'http://localhost:4000';

const API_DOMAIN = `${DOMAIN}/api/v1`;

const ID_CHECK_URL = () => `${API_DOMAIN}/auth/id-check`;
const EMAIL_CERTIFICATION_URL = () => `${API_DOMAIN}/auth/email-certification`;
const CHECK_CERTIFICATION_URL = () => `${API_DOMAIN}/auth/check-certification`;
const SIGN_UP_URL = () => `${API_DOMAIN}/auth/sign-up`;
const SIGN_IN_URL = () => `${API_DOMAIN}/auth/sign-in`;
export const SNS_SIGN_IN_URL = (type) => `${API_DOMAIN}/auth/oauth2/${type}`;

export const userIdCheckRequest = async (requestBody) => {
    const result = await axios.post(ID_CHECK_URL(), requestBody)
        .then(responseHandler)
        .catch(errorHandler);
    return result;
};

export const userEmailCertificationRequest = async (requestBody) => {
    const result = await axios.post(EMAIL_CERTIFICATION_URL(), requestBody)
        .then(responseHandler)
        .catch(errorHandler);
    return result;
};

export const checkCertificationRequest = async (requestBody) => {
    const result = await axios.post(CHECK_CERTIFICATION_URL(), requestBody)
        .then(responseHandler)
        .catch(errorHandler);
    return result;
};

export const signUpRequest = async (requestBody) => {
    const result = await axios.post(SIGN_UP_URL(), requestBody)
        .then(responseHandler)
        .catch(errorHandler);
    return result;
};

export const signInRequest = async (requestBody) => {
    const result = await axios.post(SIGN_IN_URL(), requestBody)
        .then(responseHandler)
        .catch(errorHandler);
    return result;
};
