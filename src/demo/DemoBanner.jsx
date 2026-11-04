// DEMO ONLY: "DEMO" label on every page, plus the test-account list on the login page.
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Box, Button, IconButton, Typography, useMediaQuery } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "./demoData";

const DemoBanner = () => {
  const { pathname } = useLocation();
  const onLogin = pathname === "/login" || pathname === "/loginpage" || pathname === "/";
  const isSmall = useMediaQuery("(max-width:600px)");
  // null = follow the screen size; true/false = the user chose
  const [userOpen, setUserOpen] = useState(null);
  const expanded = userOpen ?? !isSmall;

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          // Top on larger screens; bottom on phones so it doesn't cover the navbar logo
          top: { xs: "auto", sm: 0 },
          bottom: { xs: 0, sm: "auto" },
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2000,
          bgcolor: "#ff9800",
          color: "#000",
          px: 1.5,
          py: 0.25,
          borderRadius: { xs: "8px 8px 0 0", sm: "0 0 8px 8px" },
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        <Typography variant="caption" fontWeight="bold" sx={{ letterSpacing: 1 }}>
          DEMO — sample data only, resets on reload
        </Typography>
      </Box>

      {onLogin && !expanded && (
        <Button
          variant="contained"
          size="small"
          onClick={() => setUserOpen(true)}
          sx={{
            position: "fixed",
            bottom: 16,
            left: 16,
            zIndex: 2000,
            bgcolor: "rgba(10, 18, 30, 0.92)",
            color: "#fff",
            textTransform: "none",
            "&:hover": { bgcolor: "rgba(10, 18, 30, 1)" },
          }}
        >
          Demo accounts
        </Button>
      )}

      {onLogin && expanded && (
        <Box
          sx={{
            position: "fixed",
            bottom: 16,
            left: 16,
            zIndex: 2000,
            width: { xs: "calc(100vw - 32px)", sm: 290 },
            bgcolor: "rgba(10, 18, 30, 0.92)",
            color: "#fff",
            borderRadius: 2,
            p: 2,
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            fontSize: "0.8rem",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography fontWeight="bold" sx={{ mb: 0.5 }}>
              Demo accounts
            </Typography>
            {isSmall && (
              <IconButton size="small" onClick={() => setUserOpen(false)} sx={{ color: "#fff", mt: -1 }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          <Typography variant="caption" sx={{ display: "block", mb: 1, color: "#9fd3ff" }}>
            Password for all: <strong>{DEMO_PASSWORD}</strong>. OTP: any 6 digits.
          </Typography>
          {DEMO_ACCOUNTS.map((a) => (
            <Box key={a.email} sx={{ mb: 0.75 }}>
              <Typography variant="caption" fontWeight="bold" sx={{ display: "block" }}>
                {a.label} ({a.role})
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                {a.email}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </>
  );
};

export default DemoBanner;
