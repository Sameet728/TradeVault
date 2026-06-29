//+------------------------------------------------------------------+
//|                                              TradeVaultSync.mq5  |
//|                                     Copyright 2026, TradeVault   |
//|                                          https://tradevault.app  |
//+------------------------------------------------------------------+
#property copyright "TradeVault"
#property link      "https://tradevault.app"
#property version   "1.00"

input string   InpApiKey    = "tj_YOUR_API_KEY_HERE"; // TradeVault API Key
input string   InpEndpoint  = "http://localhost:3000/api/mt5/sync"; // TradeVault Sync URL

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
  {
   Print("TradeVault Sync EA Initialized.");
   Print("Ensure you have added the endpoint URL to MT5: Tools -> Options -> Expert Advisors -> Allow WebRequest");
   return(INIT_SUCCEEDED);
  }

//+------------------------------------------------------------------+
//| TradeTransaction function                                        |
//+------------------------------------------------------------------+
void OnTradeTransaction(const MqlTradeTransaction &trans,
                        const MqlTradeRequest &request,
                        const MqlTradeResult &result)
  {
   // We only care when a deal is added to the history (i.e., a trade executes)
   if(trans.type == TRADE_TRANSACTION_DEAL_ADD)
     {
      ulong deal_ticket = trans.deal;
      if(HistoryDealSelect(deal_ticket))
        {
         long entry = HistoryDealGetInteger(deal_ticket, DEAL_ENTRY);
         // Only process if it's a closing deal (DEAL_ENTRY_OUT)
         if(entry == DEAL_ENTRY_OUT || entry == DEAL_ENTRY_INOUT)
           {
            SendTradeToTradeVault(deal_ticket);
           }
        }
     }
  }

//+------------------------------------------------------------------+
//| Helper to send trade data                                        |
//+------------------------------------------------------------------+
void SendTradeToTradeVault(ulong deal_ticket)
  {
   // Get Deal properties (The close/exit)
   long deal_type = HistoryDealGetInteger(deal_ticket, DEAL_TYPE);
   double close_price = HistoryDealGetDouble(deal_ticket, DEAL_PRICE);
   double profit = HistoryDealGetDouble(deal_ticket, DEAL_PROFIT);
   double swap = HistoryDealGetDouble(deal_ticket, DEAL_SWAP);
   double commission = HistoryDealGetDouble(deal_ticket, DEAL_COMMISSION);
   double total_pnl = profit + swap + commission;
   double volume = HistoryDealGetDouble(deal_ticket, DEAL_VOLUME);
   long close_time = HistoryDealGetInteger(deal_ticket, DEAL_TIME);
   string symbol = HistoryDealGetString(deal_ticket, DEAL_SYMBOL);
   
   // A Deal is linked to a Position ID
   long position_id = HistoryDealGetInteger(deal_ticket, DEAL_POSITION_ID);
   
   // Get History Order properties (The open/entry)
   double open_price = 0;
   double sl = 0;
   double tp = 0;
   long open_time = 0;
   string type_str = (deal_type == DEAL_TYPE_SELL) ? "buy" : "sell"; // If we closed by selling, the original trade was a buy
   
   // Loop through history orders to find the order that opened this position
   HistorySelect(0, TimeCurrent());
   int total_orders = HistoryOrdersTotal();
   for(int i = 0; i < total_orders; i++)
     {
      ulong order_ticket = HistoryOrderGetTicket(i);
      if(HistoryOrderGetInteger(order_ticket, ORDER_POSITION_ID) == position_id)
        {
         long order_state = HistoryOrderGetInteger(order_ticket, ORDER_STATE);
         // Find the filled order that initiated the position
         if(order_state == ORDER_STATE_FILLED || order_state == ORDER_STATE_PARTIAL)
           {
            // We assume the first order for this position ID is the open order
            open_price = HistoryOrderGetDouble(order_ticket, ORDER_PRICE_OPEN);
            sl = HistoryOrderGetDouble(order_ticket, ORDER_SL);
            tp = HistoryOrderGetDouble(order_ticket, ORDER_TP);
            open_time = HistoryOrderGetInteger(order_ticket, ORDER_TIME_SETUP);
            
            long order_type = HistoryOrderGetInteger(order_ticket, ORDER_TYPE);
            type_str = (order_type == ORDER_TYPE_BUY) ? "buy" : "sell";
            break;
           }
        }
     }
   
   long account_num = AccountInfoInteger(ACCOUNT_LOGIN);
   
   // Format timestamps to ISO 8601 strings manually
   string open_time_str = TimeToString(open_time, TIME_DATE|TIME_SECONDS);
   string close_time_str = TimeToString(close_time, TIME_DATE|TIME_SECONDS);
   // MQL5 TimeToString gives YYYY.MM.DD HH:MI:SS. We can just replace '.' with '-'
   StringReplace(open_time_str, ".", "-");
   StringReplace(close_time_str, ".", "-");
   open_time_str = open_time_str + "Z";
   close_time_str = close_time_str + "Z";

   // Build JSON payload
   string json = "{";
   json += "\"apiKey\":\"" + InpApiKey + "\",";
   json += "\"accountNumber\":\"" + IntegerToString(account_num) + "\",";
   json += "\"symbol\":\"" + symbol + "\",";
   json += "\"type\":\"" + type_str + "\",";
   json += "\"lots\":" + DoubleToString(volume, 2) + ",";
   json += "\"entryPrice\":" + DoubleToString(open_price, 5) + ",";
   json += "\"exitPrice\":" + DoubleToString(close_price, 5) + ",";
   json += "\"sl\":" + DoubleToString(sl, 5) + ",";
   json += "\"tp\":" + DoubleToString(tp, 5) + ",";
   json += "\"pnl\":" + DoubleToString(total_pnl, 2) + ",";
   json += "\"openTime\":\"" + open_time_str + "\",";
   json += "\"closeTime\":\"" + close_time_str + "\"";
   json += "}";
   
   // Send WebRequest
   char post[], result_data[];
   string result_headers;
   StringToCharArray(json, post, 0, WHOLE_ARRAY, CP_UTF8);
   
   // ArraySize(post)-1 because StringToCharArray adds a null terminator
   int post_size = ArraySize(post) - 1; 
   string headers = "Content-Type: application/json\r\n";
   
   ResetLastError();
   // 5000ms timeout
   int res = WebRequest("POST", InpEndpoint, headers, 5000, post, result_data, result_headers);
   
   if(res == 200 || res == 201)
     {
      Print("TradeVault Sync: Trade synced successfully! PnL: $", DoubleToString(total_pnl, 2));
     }
   else
     {
      Print("TradeVault Sync Error: Code ", res, " - System Error: ", GetLastError());
      string res_str = CharArrayToString(result_data);
      Print("Response from server: ", res_str);
     }
  }
