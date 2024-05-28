const ResponseMessage = {
    SUCCESS: "Success",
    VALIDATION_FAIL: "Validation Failed",
    DUPLICATE_ID: "Duplicate Id",
    SIGN_IN_FAIL: "Login information mismatch",
    CERTIFICATION_FAIL: "Certification Failed",
    DATABASE_ERROR: "Database error"
};

Object.freeze(ResponseMessage); // 오타로 인한 값 변경을 방지하기 위해 객체를 동결합니다.

export default ResponseMessage;

// enum ResponseMessage {
    
//     SUCCESS = "Success",

//     VALIDATION_FAIL = "Validation Failed",
//     DUPLICATE_ID = "Duplicate Id",

//     SIGN_IN_FAIL = "Login information mismatch",
//     CERTIFICATION_FAIL = "Certification Failed",

//     DATABASE_ERROR = "Database error",
// };

// export default ResponseMessage;