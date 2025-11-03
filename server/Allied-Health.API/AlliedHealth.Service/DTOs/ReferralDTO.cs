namespace AlliedHealth.Service.DTOs
{
    public class GetReferralDTO
    {
        public Guid Id { get; set; }
        public string Type { get; set; }
        public int PatientId { get; set; }
        public string PatientName { get; set; }
        public Guid OriginDeptId { get; set; }
        public string OriginDeptName { get; set; }
        public Guid DestinationDeptId { get; set; }
        public string DestinationDeptName { get; set; }
        public Guid TherapistId { get; set; }
        public string TherapistName { get; set; }
        public int Priority { get; set; }
        public DateOnly? ReferralDate { get; set; }
        public string Diagnosis { get; set; }
        public string Goals { get; set; }
        public string Description { get; set; }
        public DateTime? LastUpdated { get; set; }
        public bool Hidden { get; set; }
    }

    public class GetReferralDetailsDTO
    {
        public Guid Id { get; set; }
        public int PatientId { get; set; }
        public Guid OriginDeptId { get; set; }
        public Guid DestinationDeptId { get; set; }
        public int Priority { get; set; }
        public DateOnly? ReferralDate { get; set; }
        public string Diagnosis { get; set; }
        public string Goals { get; set; }
        public string Description { get; set; }
        public List<Guid> Interventions { get; set; } = new List<Guid>();
    }

    
    public class GetReferralSummaryDTO
    {
        public int TotalTasks { get; set; }
        public int OverdueTasks { get; set; }
        public int ActiveTasks { get; set; }
        public int CompletedTasks { get; set; }

        // Priority Distribution
        public int HighPriority { get; set; }
        public int MidPriority { get; set; }
        public int LowPriority { get; set; }
        public List<DeptTaskSummary> DeptWiseSummary { get; set; } = new List<DeptTaskSummary>();
    }

    public class DeptReferralSummary
    {
        public string Name { get; set; }
        public int Count { get; set; }
    }

    public class AddUpdateReferralDTO
    {
        public Guid? Id { get; set; }

        // Task Details
        public int PatientId { get; set; }
        public Guid OriginDeptId { get; set; }
        public Guid DestinationDeptId { get; set; }
        public Guid TherapistId { get; set; }
        public int Priority { get; set; }
        public string Diagnosis { get; set; }
        public string Goals { get; set; }
        public string? Description { get; set; }

        public List<Guid> Interventions { get; set; } = new List<Guid>();
    }
}
