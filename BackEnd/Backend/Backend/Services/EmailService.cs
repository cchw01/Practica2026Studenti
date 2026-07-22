using System.Text;
using System.Text.Json;

namespace Backend.Services
{
    public class EmailService
    {
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
            _httpClient = new HttpClient();
        }

        public async Task<bool> SendResetPasswordEmail(string email, string resetLink)
        {
            Console.WriteLine("===== EMAIL SERVICE A FOST APELAT =====");
            Console.WriteLine(email);
            Console.WriteLine(resetLink);

            var apiKey = _configuration["Brevo:ApiKey"];
            var senderEmail = _configuration["Brevo:SenderEmail"];
            var senderName = _configuration["Brevo:SenderName"];

            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("api-key", apiKey);

            var body = new
            {
                sender = new
                {
                    name = senderName,
                    email = senderEmail
                },

                to = new[]
                {
                    new
                    {
                        email = email
                    }
                },

                subject = "Reset your BidSphere password",

                htmlContent = $@"
                <h2>Password Reset</h2>

                <p>Hello!</p>

                <p>You requested a password reset.</p>

                <p>
                    <a href='{resetLink}'>
                        Click here to reset your password
                    </a>
                </p>

                <p>This link is valid for 15 minutes.</p>

                <p>If you did not request this, ignore this email.</p>"
            };

            var json = JsonSerializer.Serialize(body);

            var content = new StringContent(
                json,
                Encoding.UTF8,
                "application/json");

            var response = await _httpClient.PostAsync(
                "https://api.brevo.com/v3/smtp/email",
                content);

            var responseBody = await response.Content.ReadAsStringAsync();

            Console.WriteLine(response.StatusCode);
            Console.WriteLine(responseBody);

            return response.IsSuccessStatusCode;
        }
    }
}