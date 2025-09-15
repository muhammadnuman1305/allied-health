namespace AlliedHealth.Model.Entities
{
    public class Patient
    {
        public Guid UMRN { get; set; }                         // PK (uuid)
        public string FirstName { get; set; } = default!;
        public string LastName { get; set; } = default!;
        public string? BedNumber { get; set; }

        public Guid? ReferringAHP { get; set; }                // FK -> User.Id (nullable)
        public DateTime? ReferralDate { get; set; }

        public string? Diagnosis { get; set; }                  // up to 1000
        public char Gender { get; set; }                      // char(1) in DB via converter
        public DateOnly? DateOfBirth { get; set; }

        public Guid? PriorityId { get; set; }                   // FK -> Priority.Id
        public Priority? Priority { get; set; }

        public string? Notes { get; set; }                      // nvarchar(4000)
        public string? Goal { get; set; }                      // nvarchar(4000)
        public bool Hidden { get; set; }

        public Guid? CreatedBy { get; set; }                    // FK -> User.Id (diagram shows int; using Guid is consistent)
        public DateTime CreatedDate { get; set; }
        public Guid? LastModifiedBy { get; set; }               // FK -> User.Id
        public DateTime? LastModifiedDate { get; set; }

        // Navigation
        public User? ReferringAHPUser { get; set; }
        public User? CreatedByUser { get; set; }
        public User? LastModifiedByUser { get; set; }

        public ICollection<PatientOutcome> Outcomes { get; set; } = new List<PatientOutcome>();
    }
}
