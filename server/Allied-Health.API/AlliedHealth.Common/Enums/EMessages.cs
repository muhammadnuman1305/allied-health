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
        public static string WardExistAlready { get; set; } = "Ward with same name or code already exists.";
        public static string WardNotExists { get; set; } = "Ward doesn't exist.";
        public static string TaskExistAlready { get; set; } = "There is already an active task for this patient.";
        public static string TaskNotExists { get; set; } = "Task doesn't exist.";
        public static string IncorrectUserPassword { get; set; } = "Invalid user password.";
    }
}
