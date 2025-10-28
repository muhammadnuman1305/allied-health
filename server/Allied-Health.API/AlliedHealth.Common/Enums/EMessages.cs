namespace AlliedHealth.Common.Enums
{
    public static class EMessages
    {
        public static string UserExistAlready { get; set; } = "User exists already.";
        public static string UserNotExists { get; set; } = "User doesn't exist.";
        public static string PatientExistAlready { get; set; } = "Patient exists already.";
        public static string PatientNotExists { get; set; } = "Patient with provided MRN doesn't exist.";
        public static string DeptExistAlready { get; set; } = "Department exists already.";
        public static string DeptNotExists { get; set; } = "Department doesn't exist.";
        public static string IncorrectUserPassword { get; set; } = "Invalid user password.";
    }
}
