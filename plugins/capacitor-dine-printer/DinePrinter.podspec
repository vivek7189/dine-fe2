require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = 'DinePrinter'
  s.version      = package['version']
  s.summary      = package['description']
  s.license      = package['license'] || 'MIT'
  s.homepage     = 'https://github.com/kevinjane71/dine-frontend'
  s.author       = 'DineOpen'
  s.source       = { :git => 'https://github.com/kevinjane71/dine-frontend.git', :tag => s.version.to_s }
  s.source_files = 'ios/Plugin/**/*.{swift,h,m,c,cc,mm,cpp}'
  s.ios.deployment_target = '13.0'
  s.swift_version = '5.1'
  s.dependency 'Capacitor'
  s.dependency 'CapacitorCordova'
  s.frameworks = 'CoreBluetooth'
end
