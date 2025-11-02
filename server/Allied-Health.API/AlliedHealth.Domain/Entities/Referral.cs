namespace AlliedHealth.Domain.Entities
{
    public class Referral
    {
        public Guid Id { get; set; }

        public int PatientId { get; set; }
        public Guid ReferringTherapist { get; set; }
        public Guid OriginDepartmentId { get; set; }
        public Guid DestinationDepartmentId { get; set; }

        public string? Diagnosis { get; set; }
        public string? Goals { get; set; }
        public string? Description { get; set; }
        public int Priority { get; set; }
        public int Status { get; set; }

        public DateTime CreatedDate { get; set; }
        public Guid? CreatedBy { get; set; }
        public DateTime ModifiedDate { get; set; }
        public Guid? ModifiedBy { get; set; }
        public bool Hidden { get; set; }

        // Navigation
        public Patient Patient { get; set; } = default!;
        public Department OriginDepartment { get; set; } = default!;
        public Department DestinationDepartment { get; set; } = default!;

        public ICollection<ReferralIntervention> ReferralInterventions { get; set; } = new List<ReferralIntervention>();
        public ICollection<Task> Tasks { get; set; } = new List<Task>();
    }
}
