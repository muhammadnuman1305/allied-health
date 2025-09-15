namespace AlliedHealth.Service.Helpers
{
    public class PasswordHelper
    {
        public static string HashPassword(string password)
        {
            // Implement a secure hashing algorithm here, e.g., BCrypt, PBKDF2, etc.
            // For demonstration purposes, we'll use a simple SHA256 hash (not recommended for production).
            using (var sha256 = System.Security.Cryptography.SHA256.Create())
            {
                var bytes = System.Text.Encoding.UTF8.GetBytes(password);
                var hash = sha256.ComputeHash(bytes);
                return Convert.ToBase64String(hash);
            }
        }
        public static bool VerifyPassword(string enteredPassword, string storedHash)
        {
            var enteredHash = HashPassword(enteredPassword);
            return enteredHash == storedHash;
        }
    }
}
