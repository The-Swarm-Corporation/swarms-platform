"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.fetchTotalChargesLastMonth = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
// Initialize Supabase client
var supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '');
/**
 * Fetches the total charges from the last month for each user.
 *
 * @returns A Promise that resolves to a Map object where the keys are user IDs and the values are the total charges.
 * @throws If there is an error fetching the total charges.
 */
function fetchTotalChargesLastMonth() {
    return __awaiter(this, void 0, void 0, function () {
        var oneMonthAgo, _a, data, error, totalChargesMap_1, totalCharges, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    oneMonthAgo = new Date();
                    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, supabase
                            .from('swarms_cloud_api_activities')
                            .select('user_id, total_cost')
                            .gte('created_at', oneMonthAgo.toISOString())
                            .not('total_cost', 'is', null)];
                case 2:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error fetching total charges last month:', error);
                        throw new Error('Error fetching total charges last month');
                    }
                    totalChargesMap_1 = new Map();
                    data.forEach(function (activity) {
                        totalChargesMap_1.set(activity.user_id, (totalChargesMap_1.get(activity.user_id) || 0) + activity.total_cost);
                    });
                    totalCharges = Array.from(totalChargesMap_1).map(function (_a) {
                        var user_id = _a[0], total_charge = _a[1];
                        return ({
                            user_id: user_id,
                            total_charge: total_charge
                        });
                    });
                    return [2 /*return*/, totalCharges];
                case 3:
                    error_1 = _b.sent();
                    console.error('Error fetching total charges last month:', error_1);
                    throw new Error('Error fetching total charges last month');
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.fetchTotalChargesLastMonth = fetchTotalChargesLastMonth;
// Usage example
fetchTotalChargesLastMonth()
    .then(function (totalCharges) {
    console.log('Total charges last month:', totalCharges);
})["catch"](function (error) {
    console.error('Failed to fetch total charges last month:', error);
});
