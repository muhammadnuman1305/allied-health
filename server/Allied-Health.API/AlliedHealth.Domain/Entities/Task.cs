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
    }
}