namespace AlliedHealth.Domain.DTOs
{
    public class GetWardDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public string Location { get; set; }
        public int BedCount { get; set; }
        public string? DefaultDepartmentName { get; set; }

        public int CurrentPatients { get; set; }
        public int OpenTasks { get; set; }
        public int OverdueTasks { get; set; }

        public DateTime? LastUpdated { get; set; }
        public bool Hidden { get; set; }
    }

    public class GetWardDetailsDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public string Location { get; set; }
        public int BedCount { get; set; }
        public string? Description { get; set; }

        // Default department (1-to-many)
        public Guid? DefaultDepartmentId { get; set; }

        // Coverage departments (many-to-many)
        public List<Guid> DepartmentCoverages { get; set; } = new();

        // Summary cards
        public int CurrentPatients { get; set; }
        public int OpenTasks { get; set; }
        public int OverdueTasks { get; set; }
        public int DeptCoverages { get; set; }
    }

    public class GetWardSummaryDTO
    {
        public int TotalWards { get; set; }
        public int ActiveWards { get; set; }
        public int TotalBeds { get; set; }
        public int OccupiedBeds { get; set; }
    }

    public class AddUpdateWardDTO
    {
        public Guid? Id { get; set; }

        // Basic Info
        public string Name { get; set; }
        public string Code { get; set; }
        public string Location { get; set; }
        public int BedCount { get; set; }
        public string? Description { get; set; }

        public Guid? DefaultDepartment { get; set; }
        public List<Guid>? CoverageDepartments { get; set; }
    }

    public class GetDefaultDepartmentDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Purpose { get; set; }
        public string Code { get; set; }
    }
}
