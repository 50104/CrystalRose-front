const ResponseCode = {
    SUCCESS: "SU",
    VALIDATION_FAIL: "VF",
    DUPLICATE_ID: "DI",
    SIGN_IN_FAIL: "SF",
    CERTIFICATION_FAIL: "CF",
    MAIL_FAIL: "MF",
    DATABASE_ERROR: "DBE"
};

Object.freeze(ResponseCode); // 오타로 인한 값 변경을 방지하기 위해 객체를 동결합니다.

export default ResponseCode;

// enum ResponseCode {

//     SUCCESS = "SU",

//     VALIDATION_FAIL = "VF",
//     DUPLICATE_ID = "DI",

//     SIGN_IN_FAIL = "SF",
//     CERTIFICATION_FAIL = "CF",

//     DATABASE_ERROR = "DBE"
// };

// export default ResponseCode;