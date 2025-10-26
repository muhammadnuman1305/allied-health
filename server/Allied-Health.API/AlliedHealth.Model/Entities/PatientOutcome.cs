namespace AlliedHealth.Model.Entities
{
    public class PatientOutcome
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public int PatientId { get; set; }            // FK → Patient.MRN
        public Patient Patient { get; set; } = default!;

        public bool Seen { get; set; }
        public bool AttemptMade { get; set; }
        public bool Declined { get; set; }
        public bool Unseen { get; set; }
        public bool Refer { get; set; }
        public string? AdditionalNote { get; set; }
    }
}
