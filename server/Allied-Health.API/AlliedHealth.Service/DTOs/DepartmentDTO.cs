namespace AlliedHealth.Domain.DTOs
{
    public class GetDepartmentDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public string DeptHeadName { get; set; }
        public int ActiveAssistants { get; set; }
        public int OpenTasks { get; set; }
        public int OverdueTasks { get; set; }
        public DateTime? LastUpdated { get; set; }
        public bool Hidden { get; set; }
    }

    public class GetDepartmentDetailsDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public string Purpose { get; set; }
        public string ContactNumber { get; set; }
        public string Email { get; set; }
        public string Description { get; set; }

        // Staff & Settings
        public Guid DeptHeadId { get; set; }
        public int DefaultTaskPriority { get; set; }
        public TimeSpan OperatingFrom { get; set; }
        public TimeSpan OperatingTo { get; set; }

        // Summary cards
        public int OpenTasks { get; set; }
        public int OverdueTasks { get; set; }
        public int ActiveStaff { get; set; }
        public int IncomingReferrals { get; set; }
    }

    public class GetDepartmentSummaryDTO
    { 
        public int TotalDepartments { get; set; }
        public int ActiveDepartments { get; set; }
        public int OpenTasks { get; set; }
        public int OverdueTasks { get; set; }
    }

    public class AddUpdateDepartmentDTO
    {
        public Guid? Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public string Purpose { get; set; }
        public string ContactNumber { get; set; }
        public string Email { get; set; }
        public string Description { get; set; }

        // Staff & Settings
        public Guid DeptHeadId { get; set; }
        public int DefaultTaskPriority { get; set; }
        public TimeSpan OperatingFrom { get; set; }
        public TimeSpan OperatingTo { get; set; }
    }

    public class GetDeptHeadOptions
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
    }
}
