<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D 크리에이터 포트폴리오 갤러리</title>
    <link rel="stylesheet" href="style.css">

    <script async src="https://unpkg.com/three@0.137.0/build/three.min.js"></script>
    <script async src="https://unpkg.com/three@0.137.0/examples/js/loaders/GLTFLoader.js"></script>
    <script async src="https://unpkg.com/three@0.137.0/examples/js/controls/OrbitControls.js"></script>
</head>
<body>

    <div id="viewer-container">
        </div>

    <div id="ui-overlay">
        
        <aside id="model-list">
            <h2>✨ 갤러리 컬렉션</h2>
            <ul id="model-menu">
                <li data-model="models/model1.glb" data-name="우주 정거장 컨셉">모델 #1: 스테이션</li>
                <li data-model="models/model2.glb" data-name="고대 유물 조각">모델 #2: 아티팩트</li>
                <li data-model="models/model3.glb" data-name="미래형 드론">모델 #3: 드론 프로토타입</li>
            </ul>
        </aside>

        <div id="model-info">
            <h3>선택된 모델 정보</h3>
            <p id="current-model-name">목록에서 모델을 선택해 주세요.</p>
            <button id="buy-button">구매/다운로드 문의</button>
        </div>
        
        <header id="main-header">
            <h1>[YOUR CREATOR NAME]</h1>
            <nav>
                <a href="#">소개</a>
                <a href="#">문의</a>
            </nav>
        </header>

    </div> <script src="script.js"></script>
</body>
</html>
:root {
    --primary-color: #00bcd4; /* 청록색 강조 */
    --bg-color: rgba(10, 10, 10, 0.7); /* 어두운 반투명 배경 */
    --text-color: #f0f0f0;
}

/* 기본 스타일 및 캔버스 */
body {
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: var(--text-color);
    overflow: hidden;
}

#viewer-container {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 0;
    background-color: #000;
}

/* 3D 뷰어 위에 표시되는 UI 컨테이너 */
#ui-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    pointer-events: none; /* 기본적으로 이 레이어는 클릭을 무시하고 아래 3D 뷰어에 전달 */
}

/* 헤더 스타일 */
#main-header {
    position: absolute;
    top: 0;
    width: 100%;
    padding: 20px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--bg-color);
    backdrop-filter: blur(5px);
    pointer-events: all; /* 헤더는 클릭 가능 */
}

#main-header h1 { margin: 0; font-size: 1.8em; color: var(--primary-color); }
#main-header nav a {
    color: var(--text-color);
    text-decoration: none;
    margin-left: 20px;
    transition: color 0.3s;
}
#main-header nav a:hover {
    color: var(--primary-color);
}

/* 왼쪽 사이드바 (모델 목록) */
#model-list {
    position: absolute;
    top: 80px; /* 헤더 아래 위치 */
    left: 0;
    width: 250px;
    height: calc(100% - 80px);
    background-color: var(--bg-color);
    backdrop-filter: blur(5px);
    padding: 20px;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.5);
    pointer-events: all; /* 사이드바는 클릭 가능 */
    overflow-y: auto;
}

#model-list h2 {
    color: var(--primary-color);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    padding-bottom: 10px;
}

#model-menu {
    list-style: none;
    padding: 0;
}

#model-menu li {
    padding: 10px 0;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;
    border-radius: 4px;
    padding-left: 5px;
}

#model-menu li:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: var(--primary-color);
}
#model-menu li.active {
    background-color: var(--primary-color);
    color: #000;
    font-weight: bold;
}

/* 오른쪽 하단 정보 패널 */
#model-info {
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 280px;
    background-color: var(--bg-color);
    backdrop-filter: blur(5px);
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    pointer-events: all; /* 정보 패널은 클릭 가능 */
}

#model-info h3 {
    margin-top: 0;
    color: var(--primary-color);
}

#buy-button {
    width: 100%;
    padding: 10px;
    margin-top: 15px;
    background-color: var(--primary-color);
    border: none;
    color: #000;
    font-weight: bold;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.3s;
}

#buy-button:hover {
    background-color: #00e5ff;
}
// --- 3D 환경 변수 초기화 ---
const container = document.getElementById('viewer-container');
let scene, camera, renderer, controls;
let currentModel = null; // 현재 로드된 3D 모델 객체를 저장

// GLTF 로더 초기화
const loader = new THREE.GLTFLoader();

// --- 초기화 함수 ---
function init() {
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 장면(Scene)
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    // 씬에 약간의 안개를 추가하여 깊이감을 줍니다
    scene.fog = new THREE.Fog(0x1a1a1a, 10, 50);

    // 카메라(Camera)
    camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 5, 10);

    // 렌더러(Renderer)
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    
    // 조명(Lighting): 전문적인 모델링 사이트처럼 3점 조명 설정
    setupLighting();
    
    // OrbitControls 설정 (마우스 상호작용)
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 부드러운 회전
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 30;

    // 초기 모델 로드 (가장 첫 번째 모델)
    const initialModel = document.querySelector('#model-menu li');
    if (initialModel) {
        loadModel(initialModel.dataset.model, initialModel.dataset.name);
        initialModel.classList.add('active');
    }

    animate();
}

function setupLighting() {
    // 키 라이트 (주광원)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(5, 5, 5);
    scene.add(keyLight);

    // 필 라이트 (보조광원 - 그림자 완화)
    const fillLight = new THREE.DirectionalLight(0xadd8e6, 0.5); // 약간 푸른색
    fillLight.position.set(-5, 0, -5);
    scene.add(fillLight);

    // 림 라이트 (역광 - 모델의 윤곽 강조)
    const rimLight = new THREE.DirectionalLight(0xffccaa, 0.7); // 따뜻한 색
    rimLight.position.set(0, -5, 5);
    scene.add(rimLight);

    // 환경광
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
}

// --- 모델 로드 및 전환 함수 ---
function loadModel(url, name) {
    console.log(`Loading model: ${url}`);
    
    // 1. 기존 모델 제거 (전환 효과)
    if (currentModel) {
        scene.remove(currentModel);
        currentModel.traverse((object) => {
            if (!object.isMesh) return;
            object.geometry.dispose();
            if (object.material.isMaterial) {
                // 재질 및 텍스처 메모리 해제
                Object.values(object.material.textures || {}).forEach(t => t && t.dispose());
                object.material.dispose();
            }
        });
        currentModel = null;
    }

    // 로딩 상태 표시 (옵션)
    document.getElementById('current-model-name').textContent = `로딩 중: ${name}...`;

    // 2. 새 모델 로드
    loader.load(
        url,
        function (gltf) {
            currentModel = gltf.scene;
            
            // 모델의 크기 및 위치 조정 (선택 사항)
            const box = new THREE.Box3().setFromObject(currentModel);
            const center = box.getCenter(new THREE.Vector3());
            currentModel.position.sub(center); // 모델의 중심을 씬의 중앙(0,0,0)으로 이동
            
            // 카메라 위치 리셋 및 조정 (새 모델에 맞게)
            controls.reset();
            camera.position.set(0, 5, 10);

            scene.add(currentModel);
            
            // 정보 패널 업데이트
            document.getElementById('current-model-name').textContent = name;
        },
        // 로딩 진행 상황을 위한 함수 (선택 사항)
        function (xhr) {
            const percent = Math.round(xhr.loaded / xhr.total * 100);
            console.log( `${percent}% loaded` );
            document.getElementById('current-model-name').textContent = `${name} (${percent}%) 로딩 중...`;
        },
        // 오류 처리
        function (error) {
            console.error('An error happened during model loading:', error);
            document.getElementById('current-model-name').textContent = `로드 실패: ${name}`;
        }
    );
}

// --- 이벤트 리스너 설정 ---
function setupEventListeners() {
    const modelMenu = document.getElementById('model-menu');

    modelMenu.addEventListener('click', (event) => {
        const listItem = event.target.closest('li');
        if (listItem && listItem.dataset.model) {
            // 1. 모델 로드
            loadModel(listItem.dataset.model, listItem.dataset.name);

            // 2. 활성화된 항목 스타일 업데이트
            modelMenu.querySelectorAll('li').forEach(li => li.classList.remove('active'));
            listItem.classList.add('active');
        }
    });
    
    // 창 크기 변경 시 렌더러와 카메라 업데이트
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;

        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(newWidth, newHeight);
    });
}

// --- 애니메이션 루프 ---
function animate() {
    requestAnimationFrame(animate);
    
    controls.update(); // OrbitControls가 부드럽게 작동하도록 업데이트

    // 로드된 모델이 있다면, 자동으로 회전시키거나 기타 애니메이션 적용 가능
    // if (currentModel) {
    //     currentModel.rotation.y += 0.005;
    // }

    renderer.render(scene, camera);
}

// --- 사이트 시작 ---
init();
setupEventListeners();
