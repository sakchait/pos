// Services/BasketAnalysisService.cs
namespace Pos.Infrastructure.Interfaces
{
    public interface IBasketAnalysisService
    {
        Task GenerateProductPairsAsync();
    }
}