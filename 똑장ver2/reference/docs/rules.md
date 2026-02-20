# 똑장(DDokJang) Development Rules & Guidelines

> **목적**: 일관된 코드 품질 유지, 유지보수 용이성 확보, AI 에이전트 간 협업 효율화

---

## 1. Coding Style & Standards (Python)

### 1.1 Formatter & Linter
- **Formatter**: `Black` (line length 120)
- **Linter**: `Ruff`
- **Type Checker**: `MyPy` (Strict mode 권장)

### 1.2 Naming Convention
- **Variables/Functions**: `snake_case` (e.g., `calculate_tota_price`, `user_id`)
- **Classes**: `PascalCase` (e.g., `BasketItem`, `ShoppingService`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT`)
- **Private Members**: `_underscore_prefix` (e.g., `_build_context`)

### 1.3 Type Hinting
- **원칙**: 모든 함수 인자와 반환값에 타입 힌트를 반드시 명시한다.
- **복합 타입**: `list[str]`, `dict[str, Any]`, `Optional[int]` 등을 적극 활용한다. (`from typing import ...`)
- **Self**: 메서드의 첫 번째 인자 `self`에는 타입 힌트를 생략한다.

```python
def add_item(self, item_name: str, quantity: int = 1) -> bool:
    ...
```

### 1.4 Imports
- **순서**: 표준 라이브러리 -> 서드파티 라이브러리 -> 로컬 모듈
- **절대 경로**: `from src.domain.models import ...`와 같이 프로젝트 루트(src) 기준 절대 경로 import를 사용한다. (상대 경로 `..` 지양)

---

## 2. Architecture Principles (DDD + Layered)

### 2.1 Layered Architecture
1. **Domain Layer**:
   - 비즈니스 핵심 로직과 엔티티 정의 (`BasketItem`, `Plan`, `ShoppingContext`).
   - 외부 의존성(DB, API)을 절대 가지지 않는다. (Pure Python)
2. **Application Layer**:
   - 유스케이스 구현 (`RankingEngine`, `PlanService`, `ChatService`).
   - 도메인 객체를 조작하고 흐름을 제어한다.
3. **Infrastructure Layer**:
   - 외부 시스템 연동 (`NaverShoppingProvider`, `CacheService`, `DatabaseRepo`).
   - 도메인/애플리케이션 인터페이스를 구현한다.
4. **Presentation Layer (API)**:
   - Request/Response DTO 정의, 인증, 라우팅 (`FastAPI Router`).

### 2.2 LangGraph State Management
- **Immutability**: State는 가능한 불변(Immutable)으로 취급하며, 새로운 상태를 반환하여 업데이트한다.
- **TypedDict**: State 구조는 `TypedDict`로 명확히 정의한다.
- **Node Function**: 각 노드는 `(state: ChatState) -> dict` 시그니처를 따른다. (부분 업데이트 방식)

---

## 3. Testing Strategy

### 3.1 Unit Testing
- **Framework**: `pytest`
- **Mocking**: 외부 API 호출(Naver, OpenAI)은 반드시 Mocking한다. (`unittest.mock` 활용)
- **Coverage**: 핵심 비즈니스 로직(Ranking, Canonicalization)은 높은 커버리지를 유지한다.

### 3.2 Integration Testing
- 개발 환경의 SQLite를 사용하여 실제 DB 연동 테스트를 수행한다.
- API 엔드포인트 테스트 시 `Reviewable` 상태의 데이터를 미리 셋팅한다.

---

## 4. Git & Version Control

### 4.1 Commit Message Convention (Conventional Commits)
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅, 세미콜론 누락 등 (비즈니스 로직 변경 없음)
- `refactor`: 코드 리팩토링
- `test`: 테스트 코드 추가
- `chore`: 빌드 업무 수정, 패키지 매니저 설정 등

**Example**:
```
feat: Add hybrid search strategy to NaverShoppingProvider
fix: Resolve encoding issue in chat router
docs: Update Architecture.md with LangGraph details
```

---

## 5. Documentation

### 5.1 Docstrings
- 모든 공개 모듈, 함수, 클래스, 메서드에 Docstring을 작성한다. (Google Style 권장)
- 주요 로직의 복잡한 부분에는 주석을 달아 의도를 설명한다.

### 5.2 Artifact Sync
- **Code Changes -> Doc Updates**: 코드가 변경되면 관련된 문서(`PRD.md`, `TRD.md`, `Architecture.md`)를 반드시 동기화한다.
- 특히 **API 명세 변경**이나 **DB 스키마 변경** 시 문서를 최우선으로 업데이트한다.

---

## 6. Error Handling

- **Exceptions**: 사용자 정의 예외 클래스를 활용한다 (`BudgetExceededError`, `ProductNotFoundError`).
- **HTTP Status**: 적절한 HTTP 상태 코드를 반환한다. (400 Bad Request, 404 Not Found, 500 Internal Error)
- **Logging**: `logging` 모듈을 사용하여 중요 이벤트와 에러를 기록한다. (print 문 지양)
