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

    public enum ESpecialties
    {
        PhysioTherapy = 1,
        OccupationalTherapy = 2,
        SpeechTherapy = 3,
        Dietetics = 4
    }

    public enum ETaskInterventionOutcomes
    {
        Seen = 1, // S - Patient seen by AHA
        Attempted = 2, // A - There was an attempted made by AHA to see patient, however no intervention took place 
        Declined = 3, // D - Patient declined intervention
        Unseen = 4, // U - Patient was not seen by AHA (unseen).
        Handover = 5  // X - Refer to additional note or handover from AHA regarding outcome of delegation.
    }

    public enum ETaskStatus
    {
        Assigned = 1,
        InProgress = 2,
        Completed = 3,
        Overdue = 4
    }

    public enum EReferralOutcomes
    {
        Pending = 1,
        Accepted = 2,
        Rejected = 3
    }

    public enum ETaskPriorities
    {
        Low = 1,
        Medium = 2,
        High = 3,
    }
}
