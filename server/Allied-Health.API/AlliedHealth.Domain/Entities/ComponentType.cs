namespace AlliedHealth.Domain.Entities
{
    public class ComponentType
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;

        // Navigation
        public ICollection<InterventionComponent> InterventionComponents { get; set; } = new List<InterventionComponent>();
        public ICollection<TaskInterventionComponent> TaskInterventionComponents { get; set; } = new List<TaskInterventionComponent>();
        public ICollection<ReferralInterventionComponent> ReferralInterventionComponents { get; set; } = new List<ReferralInterventionComponent>();
    }
}
