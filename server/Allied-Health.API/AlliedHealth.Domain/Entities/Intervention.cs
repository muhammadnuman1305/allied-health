namespace AlliedHealth.Domain.Entities
{
    public class Intervention
    {
        public Guid Id { get; set; }                     // Primary Key
        public Guid SpecialtyId { get; set; }            // FK -> Specialty
        public string Name { get; set; } = default!;     // e.g. "Mobilisation", "Diet Plan Creation"
        public string? Description { get; set; }         // Optional detail about the intervention
        public DateTime CreatedDate { get; set; }        // Audit field
        public Guid? CreatedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public Guid? ModifiedBy { get; set; }
        public bool Hidden { get; set; } = false;        // For soft-hiding deprecated interventions

        // Navigation
        public Specialty Specialty { get; set; } = default!;
        public ICollection<TaskIntervention> TaskInterventions { get; set; } = new List<TaskIntervention>();
    }
}
