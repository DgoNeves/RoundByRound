using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RoundByRound.Plugin
{
    public class RoundPlugin
    {
        public void LiveEvent(string jsonEvent, Action<object> callback)
        {
            if (callback == null)
            {
                return;
            }

            Task.Run(() => {
                callback("From C#:" + jsonEvent);
            });
        }
    }
}
