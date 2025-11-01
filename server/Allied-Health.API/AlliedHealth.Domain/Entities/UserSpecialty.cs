namespace AlliedHealth.Domain.Entities
{
    public class UserSpecialty
    {
        public Guid UserId { get; set; }
        public Guid SpecialtyId { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        // Navigation
        public User User { get; set; } = default!;
        public Specialty Specialty { get; set; } = default!;
    }
}
