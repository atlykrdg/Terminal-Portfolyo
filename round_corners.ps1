Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Atlyk\.gemini\antigravity\brain\fa849541-7de9-4040-81cc-da2a252feaa4\terminal_favicon_1782485492122.png"
$dstPath = "c:\Users\Atlyk\Desktop\terminal-portfolyo.v2 - Copy\favicon.png"
$radius = 150

$img = [System.Drawing.Image]::FromFile($srcPath)
$bmp = New-Object System.Drawing.Bitmap($img.Width, $img.Height)

$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::Transparent)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$d = $radius * 2

$path.AddArc(0, 0, $d, $d, 180, 90)
$path.AddArc($img.Width - $d, 0, $d, $d, 270, 90)
$path.AddArc($img.Width - $d, $img.Height - $d, $d, $d, 0, 90)
$path.AddArc(0, $img.Height - $d, $d, $d, 90, 90)
$path.CloseFigure()

$g.SetClip($path)
$g.DrawImage($img, 0, 0, $img.Width, $img.Height)

$g.Dispose()
$img.Dispose()

$bmp.Save($dstPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
