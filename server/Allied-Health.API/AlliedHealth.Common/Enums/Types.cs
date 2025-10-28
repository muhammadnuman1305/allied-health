using System.ComponentModel;

namespace AlliedHealth.Common.Enums
{
    public enum ModuleType
    {
        [Description("Tasks")]
        Tasks = 1,  
        [Description("Patients")]
        Patients = 2, 
        [Description("Referrals")]
        Referrals = 3,  
        [Description("Feedbacks")]
        Feedbacks = 4,  
        [Description("Reports")]
        Reports = 5,  
    }

    public enum UserRoles
    {
        Assistant = 1,
        Professional = 2,
        SuperAdmin = 3
    }

    public enum ETaskStatus
    {
        Active = 1,
        Completed = 2,
        Pending = 3,
        Overdue = 4
    }

    public enum DefaultTaskPriorities
    {
        Low = 1,
        Medium = 2,
        High = 3,
        Urgent = 4
    }
}
