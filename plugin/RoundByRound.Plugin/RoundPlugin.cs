using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RoundByRound
{
    public class RoundPlugin
    {
        public void Greetings(string jsonEvent, Action<object> callback)
        {
            Task.Run(() => {
                callback("C# Plugin:" + jsonEvent);
            });
        }

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
