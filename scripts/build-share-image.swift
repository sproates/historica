// Run with: swift scripts/build-share-image.swift
import AppKit
let bitmap = NSBitmapImageRep(bitmapDataPlanes:nil,pixelsWide:1200,pixelsHigh:630,bitsPerSample:8,samplesPerPixel:4,hasAlpha:true,isPlanar:false,colorSpaceName:.deviceRGB,bytesPerRow:0,bitsPerPixel:0)!
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep:bitmap)
func colour(_ hex: UInt32) -> NSColor {
 NSColor(calibratedRed:CGFloat((hex >> 16) & 255)/255,green:CGFloat((hex >> 8) & 255)/255,blue:CGFloat(hex & 255)/255,alpha:1)
}
let paper=colour(0xf5f7f8), ink=colour(0x162837), muted=colour(0x506372), line=colour(0xc5cfd5), accent=colour(0x315bd6)
paper.setFill();NSRect(x:0,y:0,width:1200,height:630).fill()
func text(_ text:String,_ x:CGFloat,_ y:CGFloat,_ size:CGFloat,_ bold:Bool=false,_ colour:NSColor=ink){
 let font=NSFont(name:bold ? "HelveticaNeue-Bold" : "HelveticaNeue",size:size)!
 (text as NSString).draw(at:NSPoint(x:x,y:y),withAttributes:[.font:font,.foregroundColor:colour])
}
// The same H/timeline mark used by src/components/Brand.astro.
let logo=NSBezierPath();logo.lineWidth=2.6
func stroke(_ points:[NSPoint]) {logo.move(to:points[0]);for p in points.dropFirst(){logo.line(to:p)}}
func point(_ x:CGFloat,_ y:CGFloat)->NSPoint {NSPoint(x:65+x*1.4,y:565-y*1.4)}
stroke([point(5,4),point(5,30)]);stroke([point(29,4),point(29,30)])
stroke([point(5,17),point(29,17)]);stroke([point(5,7),point(20,7)]);stroke([point(14,27),point(29,27)])
accent.setStroke();logo.stroke()
text("historica",126,515,43,true)
text("Visualising history",70,407,68,true)
text("People, places and events on a shared timeline.",72,360,27,false,muted)
line.setFill();NSRect(x:72,y:324,width:1056,height:1).fill()
text("3300 BCE",365,288,17,false,muted)
text("1500 BCE",1036,288,17,false,muted)
let axisStart:CGFloat=365, axisWidth:CGFloat=763
for (index,row) in [("Stonehenge",-3000.0,-1500.0),("Khufu’s reign",-2551.0,-2528.0),("Liangzhu",-3300.0,-2300.0)].enumerated(){
 let y=CGFloat(235-index*65)
 text(row.0,72,y-3,24,true)
 line.setFill();NSRect(x:axisStart,y:y+7,width:axisWidth,height:1).fill()
 let x=axisStart+CGFloat(row.1+3300)/1800*axisWidth
 let width=CGFloat(row.2-row.1)/1800*axisWidth
 accent.setFill();NSRect(x:x,y:y,width:width,height:16).fill()
}
text("historica.online",72,38,20,false,muted)
NSGraphicsContext.restoreGraphicsState()
let png=bitmap.representation(using:.png,properties:[:])!
try png.write(to:URL(fileURLWithPath:"web/share-historica-chronology.png"))
// Keep the former image URL working for previously fetched sharing metadata.
try png.write(to:URL(fileURLWithPath:"web/share-historica.png"))
