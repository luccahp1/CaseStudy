using HelpdeskViewModels;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Diagnostics;
using System.Reflection;
using System.Threading.Tasks;

namespace HelpDeskAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CallController : ControllerBase
    {
        private readonly CallViewModel _callVM;

        public CallController()
        {
            _callVM = new CallViewModel();
        }

        // GET: api/call
        [HttpGet]
        public async Task<ActionResult<List<CallViewModel>>> GetAll()
        {
            var calls = await _callVM.GetAll();
            return Ok(calls);
        }

        // GET: api/call/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<CallViewModel>> GetById(int id)
        {
            var call = new CallViewModel { Id = id };
            await call.GetById();
            return Ok(call);
        }

        // POST: api/call
        [HttpPost]
        public async Task<ActionResult> Add([FromBody] CallViewModel call)
        {
            try
            {
                await call.Add();

                return call.Id > 100
                    ? Ok(new { msg = "Call " + call.Id + " added!" })
                    : Ok(new { msg = "Call not added!" });
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Problem in " + GetType().Name + " " +
                MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }


        // PUT: api/call

        [HttpPut]
        public async Task<ActionResult> Update(CallViewModel call)
        {
            try
            {
                var status = await call.Update();
                return status switch
                {
                    1 => Ok(new { msg = "Call updated", call }),
                    -2 => Conflict(new { error = "Data is stale for Call " + call.Id + ", not updated" }),
                    _ => BadRequest(new { error = "Call " + call.Id + " not updated" })
                };
            }
            catch (Exception ex)
            {
               Debug.WriteLine("Problem in " + GetType().Name + " " +
               MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
               return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }


        // DELETE: api/call/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var call = new CallViewModel { Id = id };
            var status = await call.Delete();
            if (status == 1)
                return Ok(new { msg = $"Call {id} deleted" });

            return NotFound(new { error = $"Call {id} not found" });
        }
    }
}
