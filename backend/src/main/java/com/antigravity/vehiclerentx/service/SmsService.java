package com.antigravity.vehiclerentx.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;
import java.util.HashMap;

@Service
public class SmsService {
    @Value("${sms.provider:Simulator}")
    private String provider;

    @Value("${sms.api-key:}")
    private String apiKey;

    @Value("${sms.auth-token:}")
    private String authToken;

    @Value("${sms.sender-id:ANTIGRV}")
    private String senderId;

    @Value("${sms.route:otp}")
    private String route;

    @Value("${twilio.account-sid:}")
    private String twilioAccountSid;

    private final HttpClient httpClient = HttpClient.newBuilder().build();

    public Map<String, Object> sendOTP(String mobile, String otpCode) {
        Map<String, Object> result = new HashMap<>();
        
        switch (provider.toUpperCase()) {
            case "FAST2SMS":
                return sendFast2SMS(mobile, otpCode);
            case "TWILIO_VERIFY":
                return sendTwilio(mobile, otpCode);
            case "MSG91":
                return sendMSG91(mobile, otpCode);
            case "TEXTLOCAL":
                return sendTextlocal(mobile, otpCode);
            case "AMAZON_SNS":
                return sendAmazonSNS(mobile, otpCode);
            case "SIMULATOR":
            default:
                System.out.println("[SMS SIMULATOR] Real SMS Provider is set to Simulator. Code sent to " + mobile + ": " + otpCode);
                result.put("success", true);
                result.put("provider", "Simulator");
                result.put("otp", otpCode);
                return result;
        }
    }

    private Map<String, Object> sendFast2SMS(String mobile, String otpCode) {
        Map<String, Object> result = new HashMap<>();
        if (apiKey == null || apiKey.isEmpty()) {
            result.put("success", false);
            result.put("error", "Fast2SMS API Key is missing in your config.");
            return result;
        }

        try {
            String number = mobile.replaceAll("^\\+?91", "");
            String msg = "Your VehicleRentX mobile verification OTP code is " + otpCode + ". Valid for 5 minutes.";
            
            String url = "https://www.fast2sms.com/dev/bulkV2?authorization=" + URLEncoder.encode(apiKey, StandardCharsets.UTF_8) + 
                         "&message=" + URLEncoder.encode(msg, StandardCharsets.UTF_8) + 
                         "&language=english&route=q&numbers=" + URLEncoder.encode(number, StandardCharsets.UTF_8);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            String body = response.body();

            if (response.statusCode() >= 200 && response.statusCode() < 300 && body != null && body.contains("\"return\":true")) {
                result.put("success", true);
                result.put("provider", "Fast2SMS (Quick Route)");
                return result;
            }

            String otpUrl = "https://www.fast2sms.com/dev/bulkV2?authorization=" + URLEncoder.encode(apiKey, StandardCharsets.UTF_8) + 
                         "&variables_values=" + URLEncoder.encode(otpCode, StandardCharsets.UTF_8) + 
                         "&route=otp&numbers=" + URLEncoder.encode(number, StandardCharsets.UTF_8);

            HttpRequest requestOtp = HttpRequest.newBuilder()
                    .uri(URI.create(otpUrl))
                    .GET()
                    .build();

            HttpResponse<String> responseOtp = httpClient.send(requestOtp, HttpResponse.BodyHandlers.ofString());
            String bodyOtp = responseOtp.body();

            if (responseOtp.statusCode() >= 200 && responseOtp.statusCode() < 300 && bodyOtp != null && bodyOtp.contains("\"return\":true")) {
                result.put("success", true);
                result.put("provider", "Fast2SMS (OTP Route)");
                return result;
            }

            String fast2smsMsg = "Fast2SMS API rejected request.";
            if (body != null && body.contains("\"message\":")) {
                int start = body.indexOf("\"message\":");
                fast2smsMsg = body.substring(start);
            }

            System.err.println("[Fast2SMS Delivery Error]: " + fast2smsMsg);
            result.put("success", false);
            result.put("error", "Fast2SMS Error: " + fast2smsMsg);

        } catch (Exception e) {
            result.put("success", false);
            result.put("error", "Fast2SMS Gateway Error: " + e.getMessage());
        }
        return result;
    }

    private Map<String, Object> sendTwilio(String mobile, String otpCode) {
        Map<String, Object> result = new HashMap<>();
        if (twilioAccountSid == null || twilioAccountSid.isEmpty() || authToken == null || authToken.isEmpty()) {
            result.put("success", false);
            result.put("error", "Twilio Account SID or Auth Token missing.");
            return result;
        }

        try {
            String url = "https://api.twilio.com/2010-04-01/Accounts/" + twilioAccountSid + "/Messages.json";
            String from = senderId.startsWith("+") ? senderId : "+1234567890"; 
            String bodyData = "To=" + URLEncoder.encode(mobile, StandardCharsets.UTF_8) +
                              "&From=" + URLEncoder.encode(from, StandardCharsets.UTF_8) +
                              "&Body=" + URLEncoder.encode("Your Anti Gravity verification code is: " + otpCode + ". Valid for 5 minutes.", StandardCharsets.UTF_8);

            String auth = twilioAccountSid + ":" + authToken;
            String authHeader = "Basic " + Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Authorization", authHeader)
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(bodyData))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                result.put("success", true);
                result.put("provider", "Twilio");
            } else {
                result.put("success", false);
                result.put("error", "Twilio Gateway rejected delivery. HTTP " + response.statusCode());
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", "Twilio Server Error: " + e.getMessage());
        }
        return result;
    }

    private Map<String, Object> sendMSG91(String mobile, String otpCode) {
        Map<String, Object> result = new HashMap<>();
        if (apiKey == null || apiKey.isEmpty()) {
            result.put("success", false);
            result.put("error", "MSG91 API Key is missing in your config.");
            return result;
        }

        try {
            String number = mobile.replaceAll("^\\+", "");
            String templateId = route.equals("otp") ? "default_template" : route;
            String url = "https://control.msg91.com/api/v5/otp?template_id=" + URLEncoder.encode(templateId, StandardCharsets.UTF_8) + 
                         "&mobile=" + URLEncoder.encode(number, StandardCharsets.UTF_8) + 
                         "&authkey=" + URLEncoder.encode(apiKey, StandardCharsets.UTF_8) + 
                         "&otp=" + URLEncoder.encode(otpCode, StandardCharsets.UTF_8);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .POST(HttpRequest.BodyPublishers.noBody())
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                result.put("success", true);
                result.put("provider", "MSG91");
            } else {
                result.put("success", false);
                result.put("error", "MSG91 Gateway returned status: " + response.statusCode());
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", "MSG91 connection error: " + e.getMessage());
        }
        return result;
    }

    private Map<String, Object> sendTextlocal(String mobile, String otpCode) {
        Map<String, Object> result = new HashMap<>();
        if (apiKey == null || apiKey.isEmpty()) {
            result.put("success", false);
            result.put("error", "Textlocal API Key is missing.");
            return result;
        }

        try {
            String number = mobile.replaceAll("^\\+", "");
            String message = "Your Anti Gravity verification code is " + otpCode + ". Valid for 5 minutes.";
            String url = "https://api.textlocal.in/send/?apikey=" + URLEncoder.encode(apiKey, StandardCharsets.UTF_8) + 
                         "&numbers=" + URLEncoder.encode(number, StandardCharsets.UTF_8) + 
                         "&sender=" + URLEncoder.encode(senderId, StandardCharsets.UTF_8) + 
                         "&message=" + URLEncoder.encode(message, StandardCharsets.UTF_8);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                result.put("success", true);
                result.put("provider", "Textlocal");
            } else {
                result.put("success", false);
                result.put("error", "Textlocal Gateway returned status: " + response.statusCode());
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", "Textlocal Gateway connection failed: " + e.getMessage());
        }
        return result;
    }

    private Map<String, Object> sendAmazonSNS(String mobile, String otpCode) {
        Map<String, Object> result = new HashMap<>();
        if (apiKey == null || apiKey.isEmpty() || authToken == null || authToken.isEmpty()) {
            result.put("success", false);
            result.put("error", "AWS SNS credential keys are missing.");
            return result;
        }

        try {
            String host = "sns.us-east-1.amazonaws.com";
            String message = "Your Anti Gravity verification code is: " + otpCode + ". Valid for 5 minutes.";
            String url = "https://" + host + "/?Action=Publish&Version=2010-03-31" +
                         "&Message=" + URLEncoder.encode(message, StandardCharsets.UTF_8) +
                         "&PhoneNumber=" + URLEncoder.encode(mobile, StandardCharsets.UTF_8);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.noBody())
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                result.put("success", true);
                result.put("provider", "Amazon_SNS");
            } else {
                result.put("success", false);
                result.put("error", "AWS SNS rejected delivery. HTTP " + response.statusCode());
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", "AWS SNS Connection Error: " + e.getMessage());
        }
        return result;
    }
}