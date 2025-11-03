namespace AlliedHealth.Domain.Entities
{
    public class Patient
    {
        public int Id { get; set; } // PK - MRN
        public string FullName { get; set; } = default!;
        public string Email { get; set; } = default!;
        public DateOnly DateOfBirth { get; set; }
        public int Gender { get; set; }
        public string PrimaryPhone { get; set; } = default!;
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
        public string? EmergencyContactEmail { get; set; }

        // Auditing
        public Guid? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? LastModifiedBy { get; set; }
        public DateTime? LastModifiedDate { get; set; }
        public bool Hidden { get; set; } = false;

        // Navigation
        public User? CreatedByUser { get; set; }
        public User? LastModifiedByUser { get; set; }

        public ICollection<Task> Tasks { get; set; } = new List<Task>();
        public ICollection<Referral> Referrals { get; set; } = new List<Referral>();
    }
}