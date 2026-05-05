// Entities/Task.cs
namespace AlliedHealth.Domain.Entities
{
    public class Task
    {
        public Guid Id { get; set; }
        public Guid? ReferralId { get; set; }     // Optional link back to referral
        public int PatientId { get; set; }
        public Guid DepartmentId { get; set; }

        public string Title { get; set; } = default!;
        public string? Diagnosis { get; set; }
        public string? Description { get; set; }
        public string? Goals { get; set; }
        public int Priority { get; set; }
        public int Severity { get; set; } = 1; // ETaskSeverity: 1=Low, 2=Medium, 3=High, 4=Critical
        public int RequiredRepetitions { get; set; } = 0;
        public int CompletedRepetitions { get; set; } = 0;
        public DateOnly? LastReviewDate { get; set; }
        public string? TaskType { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public int Status { get; set; }

        // Auditing
        public DateTime CreatedDate { get; set; }
        public Guid? CreatedBy { get; set; }
        public DateTime ModifiedDate { get; set; }
        public Guid? ModifiedBy { get; set; }
        public bool Hidden { get; set; } = false;

        // Navigation
        public Referral? Referral { get; set; }
        public Patient Patient { get; set; } = default!;
        public Department Department { get; set; } = default!;
        public ICollection<TaskIntervention> TaskInterventions { get; set; } = new List<TaskIntervention>();
        public ICollection<TaskViewLog> ViewLogs { get; set; } = new List<TaskViewLog>();
    }
}