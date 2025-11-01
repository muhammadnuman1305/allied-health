namespace AlliedHealth.Service.DTOs
{
    public class GetSpecialtyDTO
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public DateTime? LastUpdated { get; set; }
        public bool Hidden { get; set; }
    }

    public class GetSpecialtyDetailsDTO
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
    }

    public class GetSpecialtySummaryDTO
    {
        public int TotalSpecialties { get; set; }
        public int ActiveSpecialties { get; set; }
    }

    public class AddUpdateSpecialtyDTO
    {
        public Guid? Id { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
    }
}
