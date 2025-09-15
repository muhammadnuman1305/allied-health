using Microsoft.AspNetCore.Authorization;

namespace Davidson.Api.Helpers
{
    public class ModuleAuthorizeAttribute : AuthorizeAttribute
    {
        //private readonly List<EModuleType> _moduleTypes;
        //private readonly List<string> _requiredPermissions;
        //private readonly bool _useDynamicModuleId;

        //// Constructor for non-generic controllers
        //public ModuleAuthorizeAttribute(EModuleType[] requiredModuleTypes, params string[] requiredPermissions)
        //{
        //    _moduleTypes = new List<EModuleType>(requiredModuleTypes);
        //    _requiredPermissions = new List<string>(requiredPermissions);
        //    _useDynamicModuleId = false;
        //}

        //// Constructor for generic controllers
        //public ModuleAuthorizeAttribute(params string[] requiredPermissions)
        //{
        //    _moduleTypes = new List<EModuleType>();
        //    _requiredPermissions = new List<string>(requiredPermissions);
        //    _useDynamicModuleId = true;
        //}

        //public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        //{
        //    var httpContext = context.HttpContext;

        //    // Check if the user is authenticated
        //    if (httpContext.User.Identity?.IsAuthenticated == false)
        //    {
        //        return;
        //    }

        //    // Resolver for ModuleTypeId (move from constructor)
        //    var moduleTypeResolver = httpContext?.RequestServices.GetService(typeof(IModuleTypeResolver)) as IModuleTypeResolver;
        //    if (_useDynamicModuleId)
        //    {
        //        // Dynamically determine the entity type based on the controller name
        //        var controllerName = context.RouteData.Values["controller"]?.ToString();
        //        if (controllerName != null && moduleTypeResolver != null)
        //        {
        //            var resolvedModuleType = moduleTypeResolver.ResolveModuleTypeId(controllerName);
        //            if (resolvedModuleType.HasValue)
        //            {
        //                _moduleTypes.Add(resolvedModuleType.Value);
        //            }
        //        }
        //    }

        //    var permissions = new List<string>(_requiredPermissions);
        //    if (_requiredPermissions.Count == 0)
        //    {
        //        permissions.AddRange(new[] { EPermission.Read, EPermission.Write, EPermission.Delete });
        //    }

        //    if (_requiredPermissions.Any(t => t == EPermission.Write) && !permissions.Contains(EPermission.Delete))
        //    {
        //        permissions.Add(EPermission.Delete);
        //    }

        //    if (_requiredPermissions.All(t => t == EPermission.Read))
        //    {
        //        permissions.Add(EPermission.Delete);
        //        permissions.Add(EPermission.Write);
        //    }
        //    var userClaims = context.HttpContext.User.Claims;
        //    var getProfileIdFromClaims = userClaims.FirstOrDefault(x => x.Type == "profileId");

        //    if (getProfileIdFromClaims == null)
        //    {
        //        context.Result = new ForbidResult();
        //        return;
        //    }

        //    var userProfileService = (IProfileService)httpContext.RequestServices.GetService(typeof(IProfileService));
        //    if (userProfileService == null)
        //    {
        //        throw new InvalidOperationException("User profile service is not registered.");
        //    }

        //    ProfileViewModel userProfile;
        //    try
        //    {
        //        userProfile = await userProfileService.GetById(int.Parse(getProfileIdFromClaims.Value));
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine($"Error fetching user profile: {ex.Message}");
        //        context.Result = new StatusCodeResult(500); // Internal Server Error
        //        return;
        //    }

        //    if (userProfile == null)
        //    {
        //        context.Result = new ForbidResult();
        //        return;
        //    }

        //    if (userProfile.IsAdmin == true)
        //    {
        //        return;
        //    }

        //    if (_moduleTypes.Any(t => t == EModuleType.Calendar))
        //    {
        //        return;
        //    }

        //    // Check if the user has permission for any of the provided module types
        //    foreach (var moduleType in _moduleTypes)
        //    {
        //        var requiredModuleId = (int)moduleType;
        //        var hasPermission = userProfile.ProfileDetails.Any(detail =>
        //            detail.ModuleId == requiredModuleId && permissions.Contains(detail.Permission));

        //        if (hasPermission || ModuleManager.SpecificModules.Contains(requiredModuleId))
        //        {
        //            return;
        //        }
        //    }

        //    // If no matching permissions were found, forbid access
        //    context.Result = new ForbidResult();
        //}
    }
}
