using Microsoft.AspNetCore.Identity;
using TaskManagerApi.DTOs;
using TaskManagerApi.Models;

namespace TaskManagerApi.Services;

public interface IAuthService
{
    Task<(IdentityResult Result, UserInfoResponse? User)> RegisterAsync(RegisterRequest request);
    Task<UserInfoResponse?> LoginAsync(LoginRequest request);
    Task LogoutAsync();
    Task<UserInfoResponse?> GetCurrentUserAsync(System.Security.Claims.ClaimsPrincipal principal);
}

public class AuthService(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager) : IAuthService
{
    public async Task<(IdentityResult Result, UserInfoResponse? User)> RegisterAsync(RegisterRequest request)
    {
        var user = new ApplicationUser { UserName = request.UserName, Email = request.Email };
        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded) return (result, null);

        await signInManager.SignInAsync(user, isPersistent: true);
        return (result, new UserInfoResponse { UserName = user.UserName!, Email = user.Email! });
    }

    public async Task<UserInfoResponse?> LoginAsync(LoginRequest request)
    {
        var user = await userManager.FindByNameAsync(request.UserName);
        if (user is null) return null;

        var result = await signInManager.PasswordSignInAsync(user, request.Password, isPersistent: true, lockoutOnFailure: false);
        if (!result.Succeeded) return null;

        return new UserInfoResponse { UserName = user.UserName!, Email = user.Email! };
    }

    public async Task LogoutAsync() => await signInManager.SignOutAsync();

    public async Task<UserInfoResponse?> GetCurrentUserAsync(System.Security.Claims.ClaimsPrincipal principal)
    {
        var user = await userManager.GetUserAsync(principal);
        if (user is null) return null;
        return new UserInfoResponse { UserName = user.UserName!, Email = user.Email! };
    }
}
