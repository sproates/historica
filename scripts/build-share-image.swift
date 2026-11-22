// Run with: swift scripts/build-share-image.swift
import AppKit
let bitmap = NSBitmapImageRep(bitmapDataPlanes:nil,pixelsWide:1200,pixelsHigh:630,bitsPerSample:8,samplesPerPixel:4,hasAlpha:true,isPlanar:false,colorSpaceName:.deviceRGB,bytesPerRow:0,bitsPerPixel:0)!
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep:bitmap)
let paper = NSColor(calibratedRed: 0.965, green: 0.969, blue: 0.945, alpha: 1)
let ink = NSColor(calibratedRed: 0.145, green: 0.259, blue: 0.224, alpha: 1)
let gold = NSColor(calibratedRed: 0.635, green: 0.478, blue: 0.243, alpha: 1)
paper.setFill();NSRect(x:0,y:0,width:1200,height:630).fill()
func text(_ text:String,_ x:CGFloat,_ y:CGFloat,_ size:CGFloat,_ serif:Bool=false){
 let font = serif ? NSFont(name:"Georgia",size:size)! : NSFont.systemFont(ofSize:size)
 (text as NSString).draw(at:NSPoint(x:x,y:y),withAttributes:[.font:font,.foregroundColor:ink])
}
text("historica",70,510,50,true)
text("Visualising history",70,407,68,true)
text("People, places and events on a shared timeline.",72,352,25)
ink.setFill();NSRect(x:72,y:317,width:1056,height:2).fill()
text("3300 BCE",340,286,15)
text("1500 BCE",1044,286,15)
for (i, label) in ["Stonehenge", "Khufu’s reign", "Liangzhu"].enumerated(){
 let y=CGFloat(245-i*67);text(label,72,y,20)
 let start:[CGFloat]=[471.33,667.9,340],width:[CGFloat]=[656.67,10.07,437.78]
 (i==1 ? gold : ink).setFill();NSRect(x:start[i],y:y+3,width:width[i],height:12).fill()
}
text("historica.online",72,44,19)
NSGraphicsContext.restoreGraphicsState()
try bitmap.representation(using:.png,properties:[:])!.write(to:URL(fileURLWithPath:"web/share-historica.png"))
