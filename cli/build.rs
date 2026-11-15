fn main() {
    // VERSIONINFO metadata for the Windows exe, mirroring app/windows/runner/Runner.rc.
    // Code signing expects ProductName/ProductVersion on all signed binaries.
    if std::env::var_os("CARGO_CFG_WINDOWS").is_some() {
        let mut res = winresource::WindowsResource::new();
        res.set("ProductName", "Send2All");
        res.set("FileDescription", "Send2All CLI");
        res.set("CompanyName", "Send2All Team");
        res.set("OriginalFilename", "send2all-cli.exe");
        res.set("InternalName", "send2all-cli");
        res.set("LegalCopyright", "Copyright (C) 2026 Send2All Team");
        // FileVersion/ProductVersion are derived from CARGO_PKG_VERSION automatically.
        res.compile().expect("failed to compile Windows resources");
    }
}
