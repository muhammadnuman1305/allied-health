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
        Professional = 1,
        Assistant = 2
    }
}
