namespace AlliedHealth.Domain.Entities
{
    public class ReferralInterventionComponent
    {
        public Guid Id { get; set; }
        public Guid ReferralInterventionId { get; set; }  // FK → ReferralIntervention
        public int ComponentTypeId { get; set; }           // FK → ComponentType
        public string Value { get; set; } = default!;

        // Navigation
        public ReferralIntervention ReferralIntervention { get; set; } = default!;
        public ComponentType ComponentType { get; set; } = default!;
    }
}
