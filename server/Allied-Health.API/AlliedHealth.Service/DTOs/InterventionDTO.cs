namespace AlliedHealth.Service.DTOs
{
    public class GetInterventionDTO
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required string Specialty { get; set; }
        public DateTime? LastUpdated { get; set; }
        public bool Hidden { get; set; }
    }

    public class GetInterventionDetailsDTO
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public Guid SpecialtyId { get; set; }
        public string? Description { get; set; }
    }

    public class GetInterventionSummaryDTO
    {
        public int TotalInterventions { get; set; }
        public int ActiveInterventions { get; set; }
    }

    public class AddUpdateInterventionDTO
    {
        public Guid? Id { get; set; }
        public required string Name { get; set; }
        public Guid SpecialtyId { get; set; }
        public string? Description { get; set; }
    }

    public class GetInterventionSpecialtiesDTO
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
    }
}
