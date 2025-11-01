namespace AlliedHealth.Service.DTOs
{
    public class GetReferralDTO
    {
        public Guid Id { get; set; }
        public required string Title { get; set; }
        public int PatientId { get; set; }
        public string PatientName { get; set; }
        public Guid DepartmentId { get; set; }
        public string DepartmentName { get; set; }
        public int Priority { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public DateTime? LastUpdated { get; set; }
        public bool Hidden { get; set; }
    }

    public class GetReferralDetailsDTO
    {
        public Guid Id { get; set; }
        public int PatientId { get; set; }
        public Guid DepartmentId { get; set; }
        public required string Title { get; set; }
        public int Priority { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public string Diagnosis { get; set; }
        public string Goals { get; set; }
        public string Description { get; set; }
        public DateTime? LastUpdated { get; set; }
        public bool Hidden { get; set; }

        public List<TaskInterventionDTO> Interventions { get; set; } = new List<TaskInterventionDTO>();
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
        public Guid DepartmentId { get; set; }
        public string Title { get; set; }
        public int Priority { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public string Diagnosis { get; set; }
        public string Goals { get; set; }
        public string? Description { get; set; }

        public List<TaskInterventionDTO> Interventions { get; set; }
    }

    public class ReferralInterventionDTO
    {
        public Guid Id { get; set; }
        public Guid AhaId { get; set; }
        public Guid WardId { get; set; }
        public DateOnly Start { get; set; }
        public DateOnly End { get; set; }
    }
}
