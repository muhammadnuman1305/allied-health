using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.OData.Extensions;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System.Net;
public class ODataCountActionFilter : IActionFilter
{
    // This method is executed after the action method is called.
    public void OnActionExecuted(ActionExecutedContext context)
    {
        // Attempt to cast the action result to an ObjectResult type.
        var objectResult = context.Result as ObjectResult;

        // If the action result is of type ObjectResult and its value is IQueryable,
        // then proceed with the logic inside.
        if (objectResult?.Value is IQueryable queryable)
        {
            // Fetch the TotalCount feature from OData context.
            var count = context.HttpContext.ODataFeature().TotalCount;

            // If the count is not null, then proceed.
            if (count.HasValue)
            {
                // Create an anonymous object with two properties:
                // 1. odatacount: holds the actual count.
                // 2. value: holds the queryable results.
                var responseContent = new
                {
                    @odatacount = count.Value,
                    value = queryable
                };

                // Adjust the JsonSerializerSettings to produce camelCase output.
                var settings = new JsonSerializerSettings
                {
                    ContractResolver = new CamelCasePropertyNamesContractResolver(),
                    ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                };

                // Serialize the responseContent object into a JSON string with camelCase format.
                var jsonString = JsonConvert.SerializeObject(responseContent, settings);

                //var options = new JsonSerializerOptions
                //{
                //    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                //    ReferenceHandler = ReferenceHandler.Preserve
                //};

                //var jsonString = System.Text.Json.JsonSerializer.Serialize(responseContent, options);

                // Replace the current action result with a new ContentResult.
                // The new result will have the JSON string as its content, a content type of "application/json",
                // and an HTTP status code of 200 (OK).
                context.Result = new ContentResult
                {
                    Content = jsonString,
                    ContentType = "application/json",
                    StatusCode = (int)HttpStatusCode.OK
                };
            }
        }
    }

    // This method is executed before the action method is called.
    // It's currently empty, meaning no logic is performed before action execution.
    public void OnActionExecuting(ActionExecutingContext context)
    {
        // Nothing to do here (for now).
    }
}