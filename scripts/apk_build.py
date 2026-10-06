# -*- coding: utf-8 -*-
# 云端 APK 构建（Linux + Android SDK）。现场生成签名 keystore，无需入库。
# 用法: python3 apk_build.py <template_dir> <assets_dir> <out_apk> <android_home>
import zipfile, os, sys, shutil, subprocess, glob

def run(cmd, cwd=None):
    p = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    return p.returncode, p.stdout, p.stderr

def find_tool(home, name):
    hits = glob.glob(os.path.join(home, 'build-tools', '*', name))
    return sorted(hits)[-1] if hits else None

def main():
    tpl, assets, out_apk, home = sys.argv[1:5]
    work = os.path.join(os.path.dirname(out_apk), 'apkbuild')
    shutil.rmtree(work, ignore_errors=True)
    os.makedirs(work)

    # 1. 壳文件
    for f in ('AndroidManifest.xml', 'classes.dex', 'resources.arsc'):
        shutil.copy(os.path.join(tpl, f), os.path.join(work, f))
    ad = os.path.join(work, 'assets')
    shutil.copytree(assets, ad)

    # 2. 现场生成签名 keystore
    ks = os.path.join(os.path.dirname(out_apk), 'debug.keystore')
    if os.path.exists(ks): os.remove(ks)
    code, o, e = run(['keytool', '-genkeypair', '-keystore', ks, '-alias', 'aichat',
                      '-storepass', 'android', '-keypass', 'android', '-keyalg', 'RSA',
                      '-keysize', '2048', '-validity', '10000',
                      '-dname', 'CN=AI Chat, O=Personal, C=CN'])
    if code != 0:
        print('KEYTOOL_FAIL\n' + e); sys.exit(1)

    # 3. 打包（resources.arsc 必须 STORED）
    unsigned = out_apk + '.unsigned'
    for f in (unsigned, out_apk):
        if os.path.exists(f): os.remove(f)
    entries = []
    for root, dirs, files in os.walk(work):
        for fn in files:
            full = os.path.join(root, fn)
            rel = os.path.relpath(full, work).replace('\\', '/')
            entries.append((rel, full))
    entries.sort(key=lambda x: (x[0] != 'resources.arsc', x[0]))
    with zipfile.ZipFile(unsigned, 'w') as z:
        for rel, full in entries:
            ct = zipfile.ZIP_STORED if rel == 'resources.arsc' else zipfile.ZIP_DEFLATED
            z.write(full, rel, compress_type=ct)

    # 4. zipalign
    zipalign = find_tool(home, 'zipalign')
    code, o, e = run([zipalign, '-p', '-f', '4', unsigned, out_apk])
    if code != 0:
        print('ZIPALIGN_FAIL\n' + e); sys.exit(1)

    # 5. apksigner 签名
    apksigner = find_tool(home, 'apksigner')
    code, o, e = run([apksigner, 'sign', '--ks', ks, '--ks-key-alias', 'aichat',
                      '--ks-pass', 'pass:android', '--key-pass', 'pass:android',
                      '--v2-signing-enabled', 'true', '--v3-signing-enabled', 'true', out_apk])
    if code != 0:
        print('SIGN_FAIL\n' + e); sys.exit(1)

    # 6. 验证
    code, o, e = run([apksigner, 'verify', '--verbose', out_apk])
    print(o)
    v2 = 'v2 scheme (APK Signature Scheme v2): true' in o
    v3 = 'v3 scheme (APK Signature Scheme v3): true' in o
    print('APK_SIZE:', os.path.getsize(out_apk))
    if not (v2 or v3):
        print('VERIFY_FAIL'); sys.exit(1)
    print('BUILD_OK')

main()
