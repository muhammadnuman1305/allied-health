// Entities/ReferralIntervention.cs
namespace AlliedHealth.Domain.Entities
{
    public class ReferralIntervention
    {
        public Guid Id { get; set; }

        public Guid ReferralId { get; set; }      // FK → Referral
        public Guid InterventionId { get; set; }  // FK → Intervention

        // Navigation
        public Referral Referral { get; set; } = default!;
        public Intervention Intervention { get; set; } = default!;
    }
}