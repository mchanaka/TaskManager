namespace TaskManagerApi.Gateways;

public interface IExternalApiGateway
{
    Task<string> GetAsync(string url);
    Task<string> PostAsync(string url, object payload);
}

public class ExternalApiGateway(HttpClient httpClient) : IExternalApiGateway
{
    public async Task<string> GetAsync(string url)
    {
        var response = await httpClient.GetAsync(url);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsStringAsync();
    }

    public async Task<string> PostAsync(string url, object payload)
    {
        var response = await httpClient.PostAsJsonAsync(url, payload);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsStringAsync();
    }
}
