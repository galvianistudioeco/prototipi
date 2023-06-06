// link: https://scorm.com/scorm-explained/technical-scorm/run-time/run-time-reference/
enum ScormErrorCodes {
    No_error = 0, // No error occurred, the previous API call was successful.
    General_Exception = 101, // No specific error code exists to describe the error. Use LMSGetDiagnostic for more information.
    Invalid_argument_error = 201, // Indicates that an argument represents an invalid data model element or is otherwise incorrect.
    Element_cannot_have_children = 202, // Indicates that LMSGetValue was called with a data model element name that ends in “_children” for a data model element that does not support the “_children” suffix.
    Element_not_an_array = 203, //Cannot have count. Indicates that LMSGetValue was called with a data model element name that ends in “_count” for a data model element that does not support the “_count” suffix.
    Not_initialized = 301, //Indicates that an API call was made before the call to LMSInitialize.
    Not_implemented_error = 401, // The data model element indicated in a call to LMSGetValue or LMSSetValue is valid, but was not implemented by this LMS. SCORM 1.2 defines a set of data model elements as being optional for an LMS to implement.
    Invalid_set_value = 402, //Element is a keyword. Indicates that LMSSetValue was called on a data model element that represents a keyword (elements that end in “_children” and “_count”).
    Element_is_read_only = 403, // LMSSetValue was called with a data model element that can only be read.
    Element_is_write_only = 404, // LMSGetValue was called on a data model element that can only be written to.
    Incorrect_Data_Type = 405, // LMSSetValue was called with a value that is not consistent with the data format of the supplied data model element.
}

class ScormError extends Error {
    static is(err: any): err is ScormError {
        return (err instanceof ScormError)
    }
    constructor(public readonly code: ScormErrorCodes, message?: string) {
        if (!message) {
            message = code.toString()
        }
        super(message)
    }
}

export { ScormErrorCodes, ScormError }