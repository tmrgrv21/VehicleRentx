package com.antigravity.vehiclerentx.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class JwtService {
    @Value("${jwt.secret:vrx_super_secret_jwt_key_2026}")
    private String secret;

    private static final ObjectMapper mapper = new ObjectMapper();

    public String generateToken(Map<String, Object> claims) {
        try {
            String header = base64UrlEncode("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
            String payload = base64UrlEncode(mapper.writeValueAsString(claims));
            String signature = base64UrlEncode(hmacSha256(header + "." + payload, secret));
            return header + "." + payload + "." + signature;
        } catch (Exception e) {
            throw new RuntimeException("JWT Generation Failed", e);
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> verifyToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) return null;
            String header = parts[0];
            String payload = parts[1];
            String signature = parts[2];

            String expectedSig = base64UrlEncode(hmacSha256(header + "." + payload, secret));
            if (!signature.equals(expectedSig)) return null;

            return mapper.readValue(base64UrlDecode(payload), Map.class);
        } catch (Exception e) {
            return null;
        }
    }

    private String base64UrlEncode(String value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private String base64UrlEncode(byte[] value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
    }

    private String base64UrlDecode(String value) {
        return new String(Base64.getUrlDecoder().decode(value), StandardCharsets.UTF_8);
    }

    private byte[] hmacSha256(String data, String key) throws Exception {
        Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
        SecretKeySpec secret_key = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256_HMAC.init(secret_key);
        return sha256_HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));
    }
}