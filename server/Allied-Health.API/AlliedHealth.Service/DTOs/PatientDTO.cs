namespace AlliedHealth.Domain.DTOs
{
    public class GetPatientDTO
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public int Age { get; set; }
        public string Gender { get; set; }
        public DateTime? LastUpdated { get; set; }
        public bool Hidden { get; set; }
    }

    public class GetPatientDetailsDTO
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public int Gender { get; set; }
        public DateOnly DateOfBirth { get; set; }
        public string PrimaryPhone { get; set; }
        public string EmergencyContactName { get; set; }
        public string EmergencyContactPhone { get; set; }
        public string EmergencyContactEmail { get; set; }
    }

    public class GetPatientSummaryDTO
    { 
        public int TotalPatients { get; set; }
        public int NewPatients { get; set; }
        public int ActiveTasks { get; set; }
        public int CompletedTasks { get; set; }
    }

    public class AddUpdatePatientDTO
    {
        public int? Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public int Gender { get; set; }
        public DateOnly DateOfBirth { get; set; }
        public string PrimaryPhone { get; set; }
        public string EmergencyContactName { get; set; }
        public string EmergencyContactPhone { get; set; }
        public string EmergencyContactEmail { get; set; }
    }
}
