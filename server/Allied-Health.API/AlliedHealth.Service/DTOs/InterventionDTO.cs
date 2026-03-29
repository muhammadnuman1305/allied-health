namespace AlliedHealth.Service.DTOs
{
    // ─── List view ─────────────────────────────────────────────────────────────
    public class GetInterventionDTO
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required string Specialty { get; set; }
        public DateTime? LastUpdated { get; set; }
        public bool Hidden { get; set; }
    }

    // ─── Detail view (includes components grouped by type) ─────────────────────
    public class GetInterventionDetailsDTO
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public Guid SpecialtyId { get; set; }
        public string? Description { get; set; }
        public List<InterventionComponentGroupDTO> Components { get; set; } = new();
    }

    /// <summary>Components grouped by type, e.g. { type: "Technique", values: ["Hoist", "Slide board"] }</summary>
    public class InterventionComponentGroupDTO
    {
        public required string Type { get; set; }
        public List<string> Values { get; set; } = new();
    }

    /// <summary>A single flat component row used in create/update payloads.</summary>
    public class InterventionComponentInputDTO
    {
        public required string ComponentType { get; set; }
        public required string Value { get; set; }
    }

    // ─── Summary ────────────────────────────────────────────────────────────────
    public class GetInterventionSummaryDTO
    {
        public int TotalInterventions { get; set; }
        public int ActiveInterventions { get; set; }
    }

    // ─── Create / Update ────────────────────────────────────────────────────────
    public class AddUpdateInterventionDTO
    {
        public Guid? Id { get; set; }
        public required string Name { get; set; }
        public Guid SpecialtyId { get; set; }
        public string? Description { get; set; }
        /// <summary>Flat list of { ComponentType, Value } rows from the UI.</summary>
        public List<InterventionComponentInputDTO> Components { get; set; } = new();
    }

    // ─── Specialty options ──────────────────────────────────────────────────────
    public class GetInterventionSpecialtiesDTO
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
    }

    // ─── Component-type options ─────────────────────────────────────────────────
    public class GetComponentTypeDTO
    {
        public int Id { get; set; }
        public required string Name { get; set; }
    }
}
